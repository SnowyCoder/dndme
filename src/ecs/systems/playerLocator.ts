import { System } from "../system";
import { World } from "../world";
import { SingleEcsStorage } from "../storage";
import { Component, POSITION_TYPE, PositionComponent } from "../component";
import { UnionFindSet } from "../../util/UnionFindSet";
import { BoardSizeResource, BoardTransformResource, BOARD_SIZE_TYPE, BOARD_TRANSFORM_TYPE, PIXI_BOARD_TYPE } from "./back/pixi/pixiBoardSystem";
import { PlayerComponent, PLAYER_TYPE } from "./playerSystem";
import { DynamicTree } from "../../geometry/dynamicTree";
import { Aabb } from "../../geometry/aabb";
import { arrayRandomElement } from "../../util/array";

// If two points are closer than this they are in the same cluster
const CLUSTER_DISTANCE = 10 * 1.5 * 128;// 1 grid = 1.5m;

export const PLAYER_LOCATOR_TYPE = 'player_locator';
export type PLAYER_LOCATOR_TYPE = typeof PLAYER_LOCATOR_TYPE;

// TODO: should we always compute clusters using https://en.wikipedia.org/wiki/Dynamic_connectivity ?
export class PlayerLocatorSystem implements System {
    readonly world: World;
    readonly name = PLAYER_LOCATOR_TYPE;
    readonly dependencies = [PIXI_BOARD_TYPE, PLAYER_TYPE];

    // When the data is dirty this is set to undefined.
    // This is an array of disjoint AABBs representing clusters
    clusters: Array<Aabb> | undefined;

    constructor(world: World) {
        this.world = world;
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('focus_on_random_party', this.onFocusOnRandomParty, this);
    }

    private onComponentAdd(comp: Component): void {
        if (comp.type === PLAYER_TYPE) {
            this.clusters = undefined;
        }
    }

    private onComponentEdited(comp: Component): void {
        if (this.clusters !== undefined) return;
        if (comp.type === POSITION_TYPE) {
            if (this.world.getComponent(comp.entity, PLAYER_TYPE) !== undefined) {
                this.clusters = undefined;
            }
        }
    }

    private onComponentRemove(comp: Component): void {
        if (comp.type === PLAYER_TYPE) {
            this.clusters = undefined;
        }
    }

    private onFocusOnRandomParty(): void {
        const clusters = this.ensureClusters();

        if (clusters.length === 0) return;
        const cluster = arrayRandomElement(clusters);
        const center = cluster.getCenter();

        const trans = this.world.getResource(BOARD_TRANSFORM_TYPE) as BoardTransformResource;
        const size = this.world.getResource(BOARD_SIZE_TYPE) as BoardSizeResource;

        let changes = {
            posX: -center.x * trans.scaleX + size.width / 2,
            posY: -center.y * trans.scaleY + size.height / 2,
        };
        this.world.editResource(BOARD_TRANSFORM_TYPE, changes);
    }

    ensureClusters(): Array<Aabb> {
        if (this.clusters === undefined) this.buildClusters();
        return this.clusters!!;
    }

    buildClusters(): void {
        this.clusters = [];

        const playerStorage = this.world.getStorage(PLAYER_TYPE) as SingleEcsStorage<PlayerComponent>;
        const posStorage = this.world.getStorage(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        // I expect there to be a low number of players (<<30) and of clusters (<<10),
        // so any algorithm will do with some cache.
        // This is a O(P*N*log(P)) (where P = n. of players and N = avg. n. of players near a player)
        // algorithm that uses an UnionFindSet to compute the different sets and a differen
        // bounding box array to store the sets bounding box (that is only used to compute the cluster center)
        // The algorithm is divided into 2 parts:
        // 1.  All of the players are put into an Aabb Tree and are enumerated in a 1..P range
        // 1.5 A new UnionFindSet is built (with length P) that uses the newly enumerated players
        // 2.  For each player search all of the near players (with distance < CLUSTER_DISTANCE)
        //       and merge their sets together (updating the bounding boxes accordingly)

        let tree = new DynamicTree<PlayerComponent>();
        let playerMap = new Map<number, number>();
        // Used for nothing else than finding the center.
        let bounds = new Array<Aabb>();

        for (let player of playerStorage.getComponents()) {
            let pos = posStorage.getComponent(player.entity);
            if (pos === undefined) continue;

            tree.createProxy(Aabb.fromPoint(pos), player);
            bounds.push(Aabb.fromPoint(pos));
            playerMap.set(player.entity, playerMap.size);
        }

        let set = new UnionFindSet(playerMap.size);
        // TODO: should we build another tree or should we use the
        // generic one? the cost is the same but the generic une is (much) taller
        for (let player of playerStorage.getComponents()) {
            let pos = posStorage.getComponent(player.entity);
            if (pos === undefined) continue;

            let aabb = Aabb.fromPoint(pos);
            aabb.extend(CLUSTER_DISTANCE / 2, aabb);
            const aset = set.find(playerMap.get(player.entity)!!);

            // The query's complexity should be O(log(N)) theoretically
            // for an infinitely small Aabb
            for (let near of tree.query(aabb)) {
                if (near.tag === undefined || near.tag === player) continue;
                // join player and near

                const bset = set.find(playerMap.get(near.tag.entity)!!);
                let unionParent = set.union(aset, bset);
                if (unionParent < 0) continue;
                let other = unionParent === aset ? bset : aset;

                // Merge bounds and store them in the parent's bound
                bounds[unionParent].combine(bounds[other], bounds[unionParent]);
            }
        }

        // Get results
        // The resulting AABBs are stored in the leaders of the various sets
        // (or the tree roots if you're thinking about the UFS as a forest)
        for (let i = 0; i < bounds.length; i++) {
            if (set.parents[i] !== i) continue; // Not the root
            this.clusters.push(bounds[i]);
        }
    }

    enable(): void {
    }

    destroy(): void {
    }
}
