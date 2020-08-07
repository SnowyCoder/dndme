<template>
    <div :style="getImageStyle()">
        <div :style="getOverlayStyle()">
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import * as PIXI from "pixi.js";

    export default Vue.extend({
        props: [
            /**
             * The frame within the atlas to render.
             * frame = {x: 0, y: 0, width: 50, height: 50}
             */
            "frame",

            /**
             * The URL of the image atlas.
             * atlasUrl = "images/atlas.png"
             */
            "atlasUrl",

            /**
             * The size of the atlas in pixels.
             * atlasSize = {width: 100, height: 100}
             */
            "atlasSize",

            /**
             * The CSS color to apply to the sprite.
             * tint = "red"
             */
            "tint",
        ],
        methods: {
            getImageStyleAdjustment() {
                const position = {
                    x: this.frame.x / (this.atlasSize.width - this.frame.width + Number.EPSILON) * 100,
                    y: this.frame.y / (this.atlasSize.height - this.frame.height + Number.EPSILON) * 100
                };

                const size = {
                    x: this.atlasSize.width / this.frame.width * 100,
                    y: this.atlasSize.height / this.frame.height * 100
                };

                return {
                    position: position,
                    size: size,
                };
            },

            getImageStyle() {
                const adjustment = this.getImageStyleAdjustment();

                return {
                    backgroundImage: `url(${this.atlasUrl})`,
                    backgroundPosition: `${adjustment.position.x}% ${adjustment.position.y}%`,
                    backgroundSize: `${adjustment.size.x}% ${adjustment.size.y}%`,
                }
            },

            getOverlayStyle() {
                const adjustment = this.getImageStyleAdjustment();

                return {
                    width: '100%',
                    height: '100%',

                    maskImage: `url(${this.atlasUrl})`,
                    webkitMaskImage: `url(${this.atlasUrl})`,

                    maskPosition: `${adjustment.position.x}% ${adjustment.position.y}%`,
                    webkitMaskPosition: `${adjustment.position.x}% ${adjustment.position.y}%`,

                    maskSize: `${adjustment.size.x}% ${adjustment.size.y}%`,
                    webkitMaskSize: `${adjustment.size.x}% ${adjustment.size.y}%`,

                    backgroundColor: `${this.tint}`,
                    mixBlendMode: "multiply"
                }
            }
        }
    })
</script>

<style scoped>

</style>