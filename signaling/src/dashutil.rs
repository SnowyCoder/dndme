use std::borrow::Borrow;
use std::cmp::Ordering;
use std::hash::{BuildHasher, Hash};

use dashmap::DashMap;

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum RenameIfResult {
    Renamed,
    SourceNotFound,
    DestinationAlreadyPresent,
}

pub trait DashmapRenamable<'a, K, V, S> {
    fn rename<Q>(&'a self, key: &Q, new_key: K) -> RenameIfResult
    where
        K: Borrow<Q> + Eq + Hash,
        Q: Hash + Eq;
}

impl<'a, K, V, S> DashmapRenamable<'a, K, V, S> for DashMap<K, V, S>
where
    S: BuildHasher + Clone,
{
    fn rename<Q>(&'a self, key: &Q, new_key: K) -> RenameIfResult
    where
        K: Borrow<Q> + Eq + Hash,
        Q: Hash + Eq,
    {
        let hashf = self.hash_usize(&key);
        let hasht = self.hash_usize(&new_key);
        let idxf = self.determine_shard(hashf);
        let idxt = self.determine_shard(hasht);

        // Always lock shards in order to prevent deadlocks
        let (mut shardf, shardt) = match idxf.cmp(&idxt) {
            Ordering::Equal => unsafe { (self.shards().get_unchecked(idxf).write(), None) },
            Ordering::Less => unsafe {
                (
                    self.shards().get_unchecked(idxf).write(),
                    Some(self.shards().get_unchecked(idxt).write()),
                )
            },
            Ordering::Greater => {
                let (st, sf) = unsafe {
                    (
                        self.shards().get_unchecked(idxt).write(),
                        self.shards().get_unchecked(idxf).write(),
                    )
                };
                (sf, Some(st))
            }
        };

        // Now both are locked
        // Check if destination is present
        if shardt
            .as_ref()
            .unwrap_or(&shardf)
            .contains_key(&new_key.borrow())
        {
            return RenameIfResult::DestinationAlreadyPresent;
        }
        let (_k, v) = match shardf.remove_entry(key) {
            Some(x) => x,
            None => return RenameIfResult::SourceNotFound,
        };
        let mut shardt = shardt.unwrap_or(shardf);
        shardt.insert_unique_unchecked(new_key, v);

        RenameIfResult::Renamed
    }
}

#[cfg(test)]
mod tests {
    use super::{DashmapRenamable, RenameIfResult};
    use dashmap::DashMap;

    #[test]
    fn test_basic() {
        let dm = DashMap::new();

        dm.insert(0, 0);

        assert_eq!(dm.rename(&0, 1), RenameIfResult::Renamed);
        assert!(dm.get(&0).is_none());
        assert_eq!(dm.get(&1).unwrap().value(), &0);

        assert_eq!(dm.rename(&0, 2), RenameIfResult::SourceNotFound);

        dm.insert(2, 14);
        assert_eq!(dm.rename(&1, 2), RenameIfResult::DestinationAlreadyPresent);
        assert_eq!(dm.get(&1).unwrap().value(), &0);
        assert_eq!(dm.get(&2).unwrap().value(), &14);
    }

    #[test]
    fn test_many() {
        let dm = DashMap::new();

        for i in 0..100 {
            dm.insert(i * 100, i * 42);
        }
        for i in (0..100).rev() {
            for j in 0..100 {
                let res = dm.rename(&(i * 100 + j), i * 100 + j + 1);
                assert_eq!(res, RenameIfResult::Renamed);
            }
        }
        assert_eq!(dm.len(), 100);
    }
}
