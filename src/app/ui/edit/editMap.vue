<template>
    <div class="game">

        <b-button-toolbar type="dark" variant="info" class="bg-dark" style="width: 100%; height: var(--topbar-height); z-index: 1000;" justify>
            <b-button-group v-if="isAdmin" style="margin-right: 2rem">
                <b-button title="Undo" squared class="toolbar-btn">
                    <i class="fas fa-undo"></i>
                </b-button>
                <b-button title="Redo" squared  disabled class="toolbar-btn">
                    <i class="fas fa-redo"></i>
                </b-button>
            </b-button-group>

            <b-button-group>
                <b-button title="Inspect" squared class="toolbar-btn" v-on:click="changeTool('inspect')">
                    <i class="fas fa-hand-pointer"></i>
                </b-button>
                <b-button title="Move" squared class="toolbar-btn" v-on:click="changeTool('move')" v-if="isAdmin">
                    <i class="fas fa-arrows-alt"></i>
                </b-button>
                <b-button title="Add wall" squared class="toolbar-btn" v-on:click="changeTool('create_wall')" v-if="isAdmin">
                    <i class="fas fa-plus"/>
                </b-button>
                <b-button title="Add pin" squared class="toolbar-btn" v-on:click="changeTool('create_pin')" v-if="isAdmin">
                    <i class="fas fa-thumbtack"></i>
                </b-button>
                <b-button title="Edit grid" squared class="toolbar-btn" v-on:click="changeTool('grid')" v-if="isAdmin">
                    <i class="fas fa-border-all"/>
                </b-button>
                <b-button title="Light settings" squared class="toolbar-btn" v-on:click="changeTool('light')" v-if="isAdmin">
                  <i class="fas fa-lightbulb"/>
                </b-button>
            </b-button-group>
            <b-button title="Export map" squared  variant="success" class="btn-xs" v-on:click="phase.exportMap()" v-if="isAdmin">
                <i class="fas fa-download"/>
            </b-button>

            <div style="flex: 1 1 0;"/> <!-- Spacing -->
            <b-button title="Toggle sidebar"  variant="warning" class="btn-xs" v-b-toggle.sidebar-right>
                <i class="fas fa-angle-double-right"/>
            </b-button>
        </b-button-toolbar>


        <div id="canvas-container" style="width: 100%; height: calc(100vh - var(--topbar-height));">

        </div>

        <!----------------------------------------------------------------------------------------      SIDEBAR      -->

        <b-sidebar id="sidebar-right" title="Sidebar"
                   bg-variant="dark" text-variant="light" right visible no-header shadow
                   sidebar-class="under-navbar">
            <!----------------------------------      GRID CONTROL      ---------------------------------->
            <div class="px-3 py-2" v-show="tool === 'grid'">
                Type:
                <b-radio-group id="grid-type-radio" v-model="grid.type" buttons>
                    <b-radio value="none"><i class="fas fa-border-none"></i></b-radio>
                    <b-radio value="square"><i class="far fa-square"></i></b-radio>
                    <b-radio value="hex">
                        <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-hexagon fa-w-18"><path fill="currentColor" d="M441.5 39.8C432.9 25.1 417.1 16 400 16H176c-17.1 0-32.9 9.1-41.5 23.8l-112 192c-8.7 14.9-8.7 33.4 0 48.4l112 192c8.6 14.7 24.4 23.8 41.5 23.8h224c17.1 0 32.9-9.1 41.5-23.8l112-192c8.7-14.9 8.7-33.4 0-48.4l-112-192zM400 448H176L64 256 176 64h224l112 192-112 192z" class=""></path></svg>
                    </b-radio>
                </b-radio-group>

                <div v-if="grid.type !== 'none'">
                    <div class="d-flex flex-row align-items-center">
                        <div class="">Size:</div>
                        <div class="p-2"><b-input type="number" v-model="grid.size" min="10" max="512" size="sm"></b-input></div>
                    </div>
                    <b-input type="range" min="10" max="512" v-model="grid.size"></b-input>

                    <div class="d-flex flex-row align-items-center">
                        <div>Xoffset:</div>
                        <div class="p-2"><b-input type="number" v-model="grid.offX" min="0" max="1" step="0.001" size="sm"></b-input></div>
                    </div>
                    <b-input type="range" min="0" max="1" step="0.001" v-model="grid.offX"></b-input>


                    <div class="d-flex flex-row align-items-center">
                        <div class="">Yoffset:</div>
                        <div class="p-2"><b-input type="number" v-model="grid.offY" min="0" max="1" step="0.001" size="sm"></b-input></div>
                    </div>
                    <b-input type="range" min="0" max="1" step="0.001" v-model="grid.offY"></b-input>

                    Color: {{grid.color}}
                    <b-input type="color" v-model="grid.color"></b-input>

                    <div class="d-flex flex-row align-items-center">
                        <div class="">Opacity:</div>
                        <div class="p-2"><b-input type="number" v-model="grid.opacity" min="0" max="1" step="0.001" size="sm"></b-input></div>
                    </div>
                    <b-input type="range" min="0" max="1" step="0.001" v-model="grid.opacity"></b-input>

                    <div class="d-flex flex-row align-items-center">
                        <div class="">Width:</div>
                        <div class="p-2"><b-input type="number" v-model="grid.width" min="1" max="200" size="sm"></b-input></div>
                    </div>
                    <b-input type="range" min="1" max="200" v-model="grid.width"></b-input>
                </div>
            </div>
            <!----------------------------------      ENTITY INSPECTOR      ---------------------------------->
            <div v-show="tool === 'inspect'">
                <entity-inspect
                        v-bind:components="this.selectedComponents"
                        v-bind:entity="this.selectedEntityOpts"
                        v-bind:isAdmin="isAdmin"
                        v-bind:selectedAddable="selectedAddable"
                        @ecs-property-change="onEcsPropertyChange"/>
            </div>
            <!----------------------------------      LIGHT SETTINGS      ---------------------------------->
            <div class="px-3 py-2" v-show="tool === 'light'">
                <div class="d-flex flex-row align-items-center">
                    <div class="">Light:</div>
                    <b-input type="color" v-model="light.ambientLight" :readonly="!isAdmin" @change="onAmbientLightChange"></b-input>
                </div>
                <div class="d-flex flex-row align-items-center">
                    <div class="">Needs light:</div>
                    <b-form-checkbox v-model="light.needsLight" @input="onAmbientLightChange" :readonly="!isAdmin"></b-form-checkbox>
                </div>
                <div class="d-flex flex-row align-items-center">
                    <div class="">Vision type:</div>
                    <b-button :pressed.sync="light.roleplayVision" :readonly="!isAdmin">
                        {{ light.roleplayVision ? "Roleplayer" : "Master" }}
                    </b-button>
                </div>
            </div>

            <template v-slot:footer>
                <div class="sidebar-footer">
                    {{ connectionCount }}
                    <div v-bind:class="{ rotate: connectionBuffering }" style="margin-left: 0.2rem">
                        <i class="fas fa-sync-alt"></i>
                    </div>
                </div>
            </template>
        </b-sidebar>

        <a id="hidden-download-link" style="display: none;"/>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    import {GridType, STANDARD_GRID_OPTIONS} from "../../game/grid";
    import {EditMapPhase, Tool} from "../../phase/editMap/editMapPhase";
    import EntityInspect from "../ecs/entityInspect.vue";
    import {Component} from "../../ecs/component";
    import {GridResource} from "../../ecs/resource";
    import {AddComponent} from "../../game/selectionGroup";
    import {LightSettings, LocalLightSettings} from "../../ecs/systems/lightSystem";
    import PIXI from "../../PIXI";
    import hex2string = PIXI.utils.hex2string;
    import string2hex = PIXI.utils.string2hex;

    export default Vue.extend({
        components: {EntityInspect},
        data() {
            return {
                tool: 'inspect',
                isAdmin: false,
                connectionCount: 0,
                connectionBuffering: false,
                grid: {
                    type: "none",
                    size: 1,
                    offX: 0,
                    offY: 0,
                    color: '#000000',
                    opacity: 0.5,
                    width: 2,
                },
                light: {
                    ambientLight: '#000000',
                    needsLight: true,
                    roleplayVision: false,
                },
                selectedComponents: new Array<Component>(),
                selectedEntityOpts: {},
                selectedAddable: new Array<AddComponent>(),
                phase: null as EditMapPhase,
            };
        },
        methods: {
            changeTool(tool: Tool) {
                this.phase.changeTool(tool);
            },

            onEcsPropertyChange(type: string, property: string, value: any, multiId: number) {
                this.phase.selection.setProperty(type, property, value, multiId);
            },

            onAmbientLightChange() {
              this.phase.ecs.addResource({
                type: 'light_settings',
                ambientLight: string2hex(this.light.ambientLight),
                needsLight: this.light.needsLight,
              } as LightSettings, 'update')
            }
        },
        watch: {
            grid: {
                handler: function(newGrid) {
                    newGrid.offX = Math.min(newGrid.offX, newGrid.size);
                    newGrid.offY = Math.min(newGrid.offY, newGrid.size);

                    let type;
                    switch (newGrid.type) {
                        case 'none': type = undefined; break;
                        case 'hex': type = GridType.HEXAGON; break;
                        case 'square': type = GridType.SQUARE; break;
                    }
                    if (type !== undefined) {
                        this.phase.ecs.addResource({
                            type: 'grid',
                            _save: true,
                            _sync: true,
                            gridType: type,
                            size: newGrid.size,
                            offX: newGrid.offX,
                            offY: newGrid.offY,
                            color: string2hex(newGrid.color),
                            opacity: parseFloat(newGrid.opacity),
                            width: newGrid.width,
                        } as GridResource, 'update');
                    } else {
                        this.phase.ecs.removeResource('grid', false);
                    }
                },
                deep: true,
            },
            'light.roleplayVision': function () {
                let visionType = this.light.roleplayVision ? 'rp' : 'dm';

                this.phase.ecs.editResource('local_light_settings', { visionType });
            }
        },
        mounted() {
            // TODO: Make these responsive (ex: something changes the resource in the background: the UI changes too).
            // How you may ask? I think that a subscription to 'resource_edit' will be necessary
            let grid: GridResource = this.phase.ecs.getResource('grid');
            switch (grid !== undefined ? grid.gridType : undefined) {
                case undefined:
                    this.grid.type = 'none';
                    break;
                case GridType.HEXAGON:
                    this.grid.type = 'hex'
                    break;
                case GridType.SQUARE:
                    this.grid.type = 'square'
                    break;
            }
            let opts = grid || STANDARD_GRID_OPTIONS;
            this.grid.size = opts.size;
            this.grid.offX = opts.offX;
            this.grid.offY = opts.offY;
            this.grid.color = hex2string(opts.color);
            this.grid.opacity = opts.opacity;
            this.grid.width = opts.width;

            let light: LightSettings = this.phase.ecs.getResource('light_settings');
            this.light.ambientLight = hex2string(light.ambientLight);
            this.light.needsLight = light.needsLight;
            let llight: LocalLightSettings = this.phase.ecs.getResource('local_light_settings');
            this.light.roleplayVision = llight.visionType === 'rp';


            this.eventEmitter.on('changeTool', (t: Tool) => { this.tool = t; });
        },
    });
</script>

<style scoped>
    .game {
        user-select: none;
    }

    .toolbar-btn {
        color: #fff;
        background-color: #2C3E50;
        border-color: #2C3E50;
    }

    .sidebar-footer {
        display: flex;
        align-items: center;
        justify-content: right;
    }
</style>
