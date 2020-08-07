
// Binary heap implementation from:
// http://eloquentjavascript.net/appendix2.html

export class BinaryHeap<T> {
    content: Array<T> = [];
    scoreFun: (x: T) => number;

    constructor(scoreFun: (x: T) => number) {
        this.scoreFun = scoreFun;
    }

    push(element: T) {
        // Add the new element to the end of the array.
        this.content.push(element);
        // Allow it to bubble up.
        this.bubbleUp(this.content.length - 1);
    }

    pop(): T | undefined {
        // Store the first element so we can return it later.
        let result = this.content[0];
        // Get the element at the end of the array.
        let end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it sink down.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    }

    peek(): T | undefined {
        return this.content[0];
    }

    size(): number {
        return this.content.length;
    }

    bubbleUp(n: number) {
        // Fetch the element that has to be moved.
        let element = this.content[n];
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            let parentN = Math.floor((n + 1) / 2) - 1;
            let parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFun(element) < this.scoreFun(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to move it further.
            else {
                break;
            }
        }
    }

    sinkDown(n: number) {
        // Look up the target element and its score.
        let length = this.content.length;
        let element = this.content[n];
        let elemScore = this.scoreFun(element);

        while (true) {
            // Compute the indices of the child elements.
            let child2N = (n + 1) * 2, child1N = child2N - 1;
            // This is used to store the new position of the element,
            // if any.
            let swap = null;
            let child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                let child1 = this.content[child1N];
                child1Score = this.scoreFun(child1);
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore)
                    swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                let child2 = this.content[child2N];
                let child2Score = this.scoreFun(child2);
                if (child2Score < (swap == null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap != null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
}