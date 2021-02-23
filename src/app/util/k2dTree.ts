
type Point = [number, number];

class Node {
    point: Point;
    left?: Node = undefined;
    right?: Node = undefined;
    parent?: Node;
    dimension: number;// 0: X, 1: Y

    constructor(point: Point, parent: Node | undefined, dimension: number) {
        this.point = point;
        this.parent = parent;
        this.dimension = dimension;
    }
}

export class K2dTree {
    root?: Node = undefined;

    private distance(a: Point, b: Point): number {
        let dx = a[0] - b[0];
        let dy = a[1] - b[1];
        return dx * dx + dy * dy;
    }

    private lastSearch(point: Point, node: Node | undefined, parent: Node | undefined): Node | undefined {
        while (node !== undefined) {
            parent = node;
            if (point[node.dimension] < node.point[node.dimension]) {
                node = node.left;
            } else {
                node = node.right;
            }
        }
        return parent;
    }

    private nodeSearch(point: Point): Node | undefined {
        let node = this.root;
        while (node !== undefined) {
            if (point[0] === node.point[0] && point[1] === node.point[1]) {
                return node;
            }
            if (point[node.dimension] < node.point[node.dimension]) {
                node = node.left;
            } else {
                node = node.right;
            }
        }
        return undefined;
    }

    insert(point: Point) {
        let insertPosition = this.lastSearch(point, this.root, undefined);

        if (insertPosition === undefined) {
            this.root = new Node(point, undefined, 0);
            return;
        }

        let newNode = new Node(point, insertPosition, (insertPosition.dimension + 1) & 1);
        let dimension = insertPosition.dimension;

        if (point[dimension] < insertPosition.point[dimension]) {
            insertPosition.left = newNode;
        } else {
            insertPosition.right = newNode;
        }
    }


    private findMin(node: Node | undefined, dim: number): Node | undefined {
        if (node === undefined) {
            return undefined;
        }

        if (node.dimension === dim) {
            if (node.left !== undefined) {
                return this.findMin(node.left, dim);
            }
            return node;
        }

        let own = node.point[dim];
        let left = this.findMin(node.left, dim);
        let right = this.findMin(node.right, dim);
        let min = node;

        if (left !== undefined && left.point[dim] < own) {
            min = left;
        }
        if (right !== undefined && right.point[dim] < min.point[dim]) {
            min = right;
        }

        return min;
    }

    private removeNode(node: Node) {
        if (node.left === undefined && node.right === undefined) {
            if (node.parent === undefined) {
                this.root = undefined;
                return;
            }
            let dim = node.parent.dimension;
            if (node.point[dim] < node.parent.point[dim]) {
                node.parent.left = undefined;
            } else {
                node.parent.right = undefined;
            }
            return;
        }

        // If the right subtree is not empty, swap with the minimum element on the
        // node's dimension. If it is empty, we swap the left and right subtrees and
        // do the same.
        if (node.right !== undefined) {
            let nextNode = this.findMin(node.right, node.dimension)!;
            let nextPoint = nextNode.point;
            this.removeNode(nextNode);
            node.point = nextPoint;
        } else {
            let nextNode = this.findMin(node.left, node.dimension)!;
            let nextPoint = nextNode.point;
            this.removeNode(nextNode);
            node.right = node.left;
            node.left = undefined;
            node.point = nextPoint;
        }
    }

    remove(point: Point): boolean {
        let node = this.nodeSearch(point);
        if (node === undefined) return false;

        this.removeNode(node);
        return true;
    }

    nearestPoint(point: Point, root?: Node): [Point, number] | undefined {
        root = root || this.root;
        if (root === undefined) return undefined;

        let ownDistance = this.distance(root.point, point);
        if (root.left === undefined && root.right === undefined) {
            return [root.point, ownDistance];
        }

        let bestChild;

        if (root.right === undefined) {
            bestChild = root.left;
        } else if (root.left === undefined) {
            bestChild = root.right
        } else {
            if (point[root.dimension] < root.point[root.dimension]) {
                bestChild = root.left;
            } else {
                bestChild = root.right;
            }
        }

        let [bestChildNode, bestChildDist] = this.nearestPoint(point, bestChild)!;

        let bestNode;
        let bestDist;
        if (bestChildDist < ownDistance) {
            bestNode = bestChildNode;
            bestDist = bestChildDist;
        } else {
            bestNode = root.point;
            bestDist = ownDistance;
        }

        // Searched point projected to our axis
        let linearPoint: Point = [point[0], point[1]];
        linearPoint[root.dimension] = root.point[root.dimension];

        let linearDist = this.distance(linearPoint, point);
        if (linearDist < bestDist) {
            let otherChild;
            if (bestChild === root.left) {
                otherChild = root.right;
            } else {
                otherChild = root.left;
            }
            if (otherChild !== undefined) {
                let [otherNode, otherDist] = this.nearestPoint(point, otherChild)!;
                if (otherDist < bestDist) {
                    bestNode = otherNode;
                    bestDist = otherDist;
                }
            }
        }
        return [bestNode, bestDist]
    }
}

