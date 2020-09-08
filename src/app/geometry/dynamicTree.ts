
// A version highly inspired by plank.js (https://github.com/shakiba/planck.js/blob/f5777884f537db97608d8016bda960d251d42d4d/lib/collision/DynamicTree.js)

import {Aabb} from "./aabb";
import {containsAabbVsAabb, overlapAabbVsAabb} from "./collision";
import {Point} from "./point";

class TreeNode<T> {
    id: number;
    aabb = Aabb.zero();
    tag?: T;

    parent?: TreeNode<T>;
    left?: TreeNode<T>;
    right?: TreeNode<T>;

    height: number = -1;

    constructor(id: number) {
        this.id = id;
    }

    toString(): string {
        return this.id + ": " + this.tag;
    }

    isLeaf(): boolean {
        return this.left === undefined;
    }
}


export class DynamicTree<T> {
    root?: TreeNode<T>;
    nodes = new Map<number, TreeNode<T>>();
    lastProxyId: number = 0;

    aabbExtension: number;
    aabbMultiplier: number;

    constructor(aabbExtension: number = 0.1, aabbMultiplier: number = 2) {
        this.aabbExtension = aabbExtension;
        this.aabbMultiplier = aabbMultiplier;
    }

    getTag(id: number): T {
        return this.nodes.get(id).tag;
    }

    setTag(id: number, tag: T) {

    }

    getFatAabb(id: number): Aabb {
        return this.nodes.get(id).aabb;
    }

    private allocateNode(): TreeNode<T> {
        let node = new TreeNode<T>(++this.lastProxyId);
        this.nodes.set(node.id, node);
        return node;
    }

    private freeNode(node: TreeNode<T>): void {
        this.nodes.delete(node.id);
    }

    createProxy(aabb: Aabb, tag: T): number {
        let node = this.allocateNode();

        node.aabb.copyFrom(aabb);

        // Fatten the aabb
        node.aabb.extend(this.aabbExtension, node.aabb);

        node.tag = tag;
        node.height = 0;

        this.insertLeaf(node);
        return node.id;
    }

    destroyProxy(id: number): void {
        let node = this.nodes.get(id);

        this.removeLeaf(node);
        this.freeNode(node);
    }

    moveProxy(id: number, aabb: Aabb, d: Point): boolean {
        let node = this.nodes.get(id);

        if (containsAabbVsAabb(node.aabb, aabb)) {
            return false;
        }

        this.removeLeaf(node);
        node.aabb.copyFrom(aabb);

        // Fatten
        node.aabb.extend(this.aabbExtension, node.aabb);

        // Predict motion
        if (this.aabbMultiplier !== 1) {
            if (d.x < 0) aabb.minX += d.x * this.aabbMultiplier;
            else aabb.maxX += d.x * this.aabbMultiplier;

            if (d.y < 0) aabb.minY += d.y * this.aabbMultiplier;
            else aabb.maxY += d.y * this.aabbMultiplier;
        }

        this.insertLeaf(node);

        return true;
    }

    private insertLeaf(leaf: TreeNode<T>): void {
        if (this.root === undefined) {
            this.root = leaf;
            this.root.parent = undefined;
            return;
        }

        let leafAabb = leaf.aabb;
        let index = this.root;

        while (!index.isLeaf()) {
            let left = index.left;
            let right = index.right;

            let per = index.aabb.getPerimeter();


            let combinedAabb = Aabb.zero();
            index.aabb.combine(leafAabb, combinedAabb);
            let combinedPer = combinedAabb.getPerimeter();

            let cost = combinedPer * 2;

            let inheritanceCost = (combinedPer - per) * 2;

            let costLeft;
            if (left.isLeaf()) {
                left.aabb.combine(leafAabb, combinedAabb);
                costLeft = combinedAabb.getPerimeter() + inheritanceCost;
            } else {
                left.aabb.combine(leafAabb, combinedAabb);
                let oldPerimeter = left.aabb.getPerimeter();
                let newPerimeter = combinedAabb.getPerimeter();
                costLeft = (newPerimeter - oldPerimeter) + inheritanceCost;
            }

            let costRight;
            if (right.isLeaf()) {
                right.aabb.combine(leafAabb, combinedAabb);
                costRight = combinedAabb.getPerimeter() + inheritanceCost;
            } else {
                right.aabb.combine(leafAabb, combinedAabb);
                let oldPerimeter = right.aabb.getPerimeter();
                let newPerimeter = combinedAabb.getPerimeter();
                costRight = (newPerimeter - oldPerimeter) + inheritanceCost;
            }

            if (cost < costLeft && cost < costRight) {
                break;
            }

            if (costLeft < costRight) index = left;
            else index = right;
        }

        let sibling = index;
        let oldParent = sibling.parent;
        let newParent = this.allocateNode();

        newParent.parent = oldParent;
        sibling.aabb.combine(leafAabb, newParent.aabb);
        newParent.height = sibling.height + 1;

        if (oldParent !== undefined) {
            // The sibling was not the root
            if (oldParent.left === sibling) oldParent.left = newParent;
            else                            oldParent.right = newParent;
        } else {
            // the sibling was the root
            this.root = newParent;
        }
        newParent.left = sibling;
        newParent.right = leaf;
        sibling.parent = newParent;
        leaf.parent = newParent;

        // Walk back up fixing heights and AABBs
        index = leaf.parent;
        while (index !== undefined) {
            index = this.balance(index);

            index.height = 1 + Math.max(index.left.height, index.right.height);
            index.left.aabb.combine(index.right.aabb, index.aabb);

            index = index.parent;
        }
    }

    private removeLeaf(leaf: TreeNode<T>): void {
        if (leaf === this.root) {
            this.root = undefined;
            return;
        }

        let parent = leaf.parent;
        let grandParent = parent.parent;
        let sibling;
        if (parent.left === leaf) sibling = parent.right;
        else                      sibling = parent.left;

        if (grandParent !== undefined) {
            // Destroy parent and connect sibling to grandParent
            if (grandParent.left === parent) grandParent.left = sibling;
            else                             grandParent.right = sibling;

            sibling.parent = grandParent;
            this.freeNode(parent);

            // Adjust ancestor bounds
            let index = grandParent;
            while (index !== undefined) {
                index = this.balance(index);

                index.left.aabb.combine(index.right.aabb, index.aabb);
                index.height = 1 + Math.max(index.left.height, index.right.height);

                index = index.parent;
            }
        } else {
            this.root = sibling;
            sibling.parent = undefined;
            this.freeNode(parent);
        }
    }

    /**
     * Perform a rotation if current node is imbalanced, returns the new sub-tree root.
     * @param current
     * @private
     */
    private balance(current: TreeNode<T>): TreeNode<T> {
        let a = current;

        if (a.isLeaf() || a.height < 2) return a;

        let b = a.left;
        let c = a.right;

        let balance = c.height - b.height;

        // Rotate C up
        if (balance > 1) {
            let f = c.left;
            let g = c.right;

            // Swap a and c
            c.left = a;
            c.parent = a.parent;
            a.parent = c;

            // a parent should point to c
            if (c.parent !== undefined) {
                if (c.parent.left === a) c.parent.left = c;
                else                     c.parent.right = c;
            } else {
                this.root = c;
            }

            // Rotate
            if (f.height > g.height) {
                c.right = f;
                a.right = g;
                g.parent = a;
                b.aabb.combine(g.aabb, a.aabb);
                a.aabb.combine(f.aabb, c.aabb);

                a.height = 1 + Math.max(b.height, g.height);
                c.height = 1 + Math.max(a.height, f.height);
            } else {
                c.right = g;
                a.right = f;
                f.parent = a;
                b.aabb.combine(f.aabb, a.aabb);
                a.aabb.combine(g.aabb, c.aabb);

                a.height = 1 + Math.max(b.height, f.height);
                c.height = 1 + Math.max(a.height, g.height);
            }

            return c;
        }

        if (balance < -1) {
            let d = b.left;
            let e = b.right;

            // Swap a and b
            b.left = a;
            b.parent = a.parent;
            a.parent = b;

            // a parent should point to b
            if (b.parent !== undefined) {
                if (b.parent.left === a) b.parent.left = b;
                else                     b.parent.right = b;
            } else {
                this.root = b;
            }

            // Rotate
            if (d.height > e.height) {
                b.right = d;
                a.left = e;
                e.parent = a;

                c.aabb.combine(e.aabb, a.aabb);
                a.aabb.combine(d.aabb, b.aabb);

                a.height = 1 + Math.max(c.height, e.height);
                b.height = 1 + Math.max(a.height, d.height);
            } else {
                b.right = e;
                a.left = d;
                d.parent = a;

                c.aabb.combine(d.aabb, a.aabb);
                a.aabb.combine(e.aabb, b.aabb);

                a.height = 1 + Math.max(c.height, d.height);
                b.height = 1 + Math.max(a.height, e.height);
            }

            return b;
        }

        return a;
    }

    *query(aabb: Aabb): Generator<TreeNode<T>> {
        let stack = [];

        if (this.root === undefined) return;

        //console.log("Starting query: " + aabb.toString());

        stack.push(this.root);
        while (stack.length > 0) {
            let node = stack.pop();

            let overlap = overlapAabbVsAabb(node.aabb, aabb);
            //console.log("Visit: " + node.id + " = " + overlap);
            if (!overlap) continue;

            if (node.isLeaf()) {
                yield node;
            } else {
                stack.push(node.left);
                stack.push(node.right);
            }
        }
    }
}

