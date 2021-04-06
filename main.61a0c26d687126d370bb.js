/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/compWrapper.vue?vue&type=style&index=0&id=03d324d6&scoped=true&lang=css&":
/*!***********************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/compWrapper.vue?vue&type=style&index=0&id=03d324d6&scoped=true&lang=css& ***!
  \***********************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "\n.component-header[data-v-03d324d6] {\n  display: flex;\n  align-items: center;\n  margin-left: 5px;\n  margin-bottom: 2px;\n}\n.component-header button[data-v-03d324d6]:last-child {\n  margin-right: 10px;\n}\n.component-body[data-v-03d324d6] {\n  margin-left: 12px;\n  margin-right: 12px;\n}\n.g11[data-v-03d324d6] {\n  grid-row: 1;\n  grid-column: 1;\n}\n", "",{"version":3,"sources":["webpack://./src/app/ui/ecs/compWrapper.vue"],"names":[],"mappings":";AAkEA;EACA,aAAA;EACA,mBAAA;EACA,gBAAA;EACA,kBAAA;AACA;AAEA;EACA,kBAAA;AACA;AAEA;EACA,iBAAA;EACA,kBAAA;AACA;AAEA;EACA,WAAA;EACA,cAAA;AACA","sourcesContent":["<template>\n  <div>\n    <div>\n      <div class=\"component-header\">\n        <div @click=\"visible = !visible\" style=\"width: 100%\"> {{ component.type }}</div>\n        <b-button v-if=\"isAdmin\" squared size=\"sm\" style=\"display: grid;\"\n                  :title=\"component.clientVisible ? 'Hide component' : 'Show component'\"\n                  v-show=\"component.clientVisible !== undefined\"\n                  @click=\"$emit('ecs-property-change', component.type, 'clientVisible', !component.clientVisible)\">\n          <div class=\"g11\" v-show=\"component.clientVisible\"><i class=\"fas fa-eye\"/></div>\n          <div class=\"g11\" v-show=\"!component.clientVisible\"><i class=\"fas fa-eye-slash\"/></div>\n        </b-button>\n        <b-button v-if=\"isAdmin\" squared size=\"sm\" variant=\"primary\" title=\"Fullscreen\"\n                  v-show=\"component._isFullscreen !== undefined\" @click=\"component._isFullscreen = true\">\n          <i class=\"fas fa-expand\"/>\n        </b-button>\n        <b-button v-if=\"isAdmin\" squared size=\"sm\" variant=\"danger\" title=\"Delete\" v-show=\"component._canDelete\"\n                  @click=\"$emit('ecs-property-change', '$', 'removeComponent', component.type, component.multiId)\">\n          <i class=\"fas fa-trash\"/>\n        </b-button>\n      </div>\n    </div>\n    <b-collapse v-model=\"visible\" class=\"component-body\" visible>\n      <component v-bind:is=\"componentType\" v-bind:component=\"component\" v-bind:isAdmin=\"isAdmin\"\n                 v-bind:allComps=\"allComps\"\n                 v-on:ecs-property-change=\"$emit('ecs-property-change', arguments[0], arguments[1], arguments[2], arguments[3])\">\n\n      </component>\n    </b-collapse>\n  </div>\n</template>\n\n<script lang=\"ts\">\nimport ecsName from \"./ecsName.vue\";\nimport ecsNote from \"./ecsNote.vue\";\nimport ecsPosition from \"./ecsPosition.vue\";\nimport ecsWall from \"./ecsWall.vue\";\nimport ecsBackgroundImage from \"./ecsBackgroundImage.vue\";\nimport ecsPin from \"./ecsPin.vue\";\nimport ecsTransform from \"./ecsTransform.vue\";\nimport ecsLight from \"./ecsLight.vue\";\nimport ecsPlayer from \"./ecsPlayer.vue\";\nimport ecsDoor from \"./ecsDoor.vue\";\nimport ecsPropTeleport from \"./ecsPropTeleport.vue\";\nimport {Component} from \"../../ecs/component\"\nimport {Vue, VComponent, VProp} from \"../vue\";\n\n@VComponent({\n  components: {\n    ecsName, ecsNote, ecsPosition, ecsWall, ecsBackgroundImage, ecsPin, ecsTransform, ecsLight, ecsPlayer, ecsDoor,\n    ecsPropTeleport\n  }\n})\nexport default class EcsComponentWrapper extends Vue {\n  @VProp({required: true}) component!: Component;\n  @VProp({default: false}) isAdmin!: boolean;\n  @VProp() allComps?: Array<Component>;\n  visible = true;\n\n  get componentType(): string {\n    return 'ecs-' + this.component.type.replace('_', '-');\n  }\n}\n</script>\n\n<style scoped>\n.component-header {\n  display: flex;\n  align-items: center;\n  margin-left: 5px;\n  margin-bottom: 2px;\n}\n\n.component-header button:last-child {\n  margin-right: 10px;\n}\n\n.component-body {\n  margin-left: 12px;\n  margin-right: 12px;\n}\n\n.g11 {\n  grid-row: 1;\n  grid-column: 1;\n}\n</style>"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/entityInspect.vue?vue&type=style&index=0&id=c407dbfa&scoped=true&lang=css&":
/*!*************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/entityInspect.vue?vue&type=style&index=0&id=c407dbfa&scoped=true&lang=css& ***!
  \*************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "\n.component-btn-header[data-v-c407dbfa] {\n  margin: 0.5rem;\n  display: flex;\n  align-items: center;\n  justify-content: right;\n}\n.g11[data-v-c407dbfa] {\n  grid-column: 1;\n  grid-row: 1;\n}\n", "",{"version":3,"sources":["webpack://./src/app/ui/ecs/entityInspect.vue"],"names":[],"mappings":";AAyEA;EACA,cAAA;EACA,aAAA;EACA,mBAAA;EACA,sBAAA;AACA;AAEA;EACA,cAAA;EACA,WAAA;AACA","sourcesContent":["<template>\n  <div v-show=\"components.length > 0\">\n    <div class=\"component-btn-header\">\n      <b-dropdown toggle-class=\"rounded-0\" variant=\"success\" v-if=\"isAdmin\">\n        <template v-slot:button-content>\n          <i class=\"fas fa-plus\"></i>\n        </template>\n        <b-dropdown-item v-for=\"x in selectedAddable\" :key=\"x.type\" @click=\"emitSpecial('addComponent', x.type)\">\n          {{ x.name }}\n        </b-dropdown-item>\n      </b-dropdown>\n      <b-button squared :title=\"entity.hidden ? 'Show entity' : 'Hide entity'\" style=\"display: grid\" v-if=\"isAdmin\"\n                @click=\"emitSpecial('hidden', !entity.hidden)\">\n        <div class=\"g11\" :style=\"{visibility: entity.hidden ? 'visible' : 'hidden'}\"><i class=\"fas fa-eye-slash\"/></div>\n        <div class=\"g11\" :style=\"{visibility: entity.hidden ? 'hidden' : 'visible'}\"><i class=\"fas fa-eye\"/></div>\n      </b-button>\n      <b-button v-if=\"isAdmin\" variant=\"danger\" title=\"Delete entity\" squared\n                @click=\"emitSpecial('delete')\">\n        <i class=\"fas fa-trash\"></i>\n      </b-button>\n    </div>\n\n    <ecs-component-wrapper v-for=\"comp of renderedComponents\" v-bind:key=\"comp.type + (comp.multiId || '')\"\n                           v-bind:component=\"comp\" v-bind:isAdmin=\"isAdmin\" v-bind:allComps=\"allComponents\"\n                           @ecs-property-change=\"$emit('ecs-property-change', arguments[0], arguments[1], arguments[2], arguments[3])\"/>\n  </div>\n</template>\n\n<script lang=\"ts\">\nimport EcsComponentWrapper from \"./compWrapper.vue\";\nimport {VComponent, VProp, Vue, VWatch} from \"../vue\";\nimport {Component, TransformComponent} from \"../../ecs/component\";\n\n@VComponent({\n  components: {\n    EcsComponentWrapper,\n  }\n})\nexport default class EntityInspect extends Vue {\n  @VProp({required: true})\n  entity!: {\n    hidden: boolean,\n    ids: Array<number>\n  };\n\n  @VProp({required: true})\n  components!: Array<Component>;\n\n  @VProp({required: true})\n  isAdmin!: boolean;\n\n  @VProp({required: true})\n  selectedAddable!: Array<{name: string}>;\n\n  get renderedComponents(): Array<Component> {\n    return this.components.filter((c: any) => c._save && c._sync);\n  }\n\n  get allComponents(): {[key: string]: Component} {\n    let m = {} as any;\n    for (let c of this.components) {\n      m[c.type] = c;\n    }\n    return m;\n  }\n\n  emitSpecial(name: string, par: unknown) {\n    this.$emit('ecs-property-change', '$', name, par);\n  }\n}\n</script>\n\n<style scoped>\n.component-btn-header {\n  margin: 0.5rem;\n  display: flex;\n  align-items: center;\n  justify-content: right;\n}\n\n.g11 {\n  grid-column: 1;\n  grid-row: 1;\n}\n</style>"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/editMap.vue?vue&type=style&index=0&id=53b46051&scoped=true&lang=css&":
/*!********************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/editMap.vue?vue&type=style&index=0&id=53b46051&scoped=true&lang=css& ***!
  \********************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "\n.game[data-v-53b46051] {\n  user-select: none;\n}\n.toolbar-btn[data-v-53b46051] {\n  color: #fff;\n  background-color: #2C3E50;\n  border-color: #2C3E50;\n}\n.sidebar-footer[data-v-53b46051] {\n  display: flex;\n  align-items: center;\n  justify-content: right;\n}\n.undo-redo-btn.disabled[data-v-53b46051], .undo-redo-btn[data-v-53b46051]:disabled {\n  background-color: #343a40;\n  border-color: #343a40;\n  box-shadow: none;\n}\n", "",{"version":3,"sources":["webpack://./src/app/ui/edit/editMap.vue"],"names":[],"mappings":";AA+NA;EACA,iBAAA;AACA;AAEA;EACA,WAAA;EACA,yBAAA;EACA,qBAAA;AACA;AAEA;EACA,aAAA;EACA,mBAAA;EACA,sBAAA;AACA;AAEA;EACA,yBAAA;EACA,qBAAA;EACA,gBAAA;AACA","sourcesContent":["<template>\n  <div class=\"game\">\n\n    <b-button-toolbar type=\"dark\" variant=\"info\" class=\"bg-dark\"\n                      style=\"width: 100%; height: var(--topbar-height); z-index: 1000;\" justify>\n      <b-button-group v-if=\"isAdmin\" style=\"margin-right: 2rem\">\n        <b-button title=\"Undo\" squared class=\"toolbar-btn undo-redo-btn\" :disabled=\"!this.canUndo\" v-on:click=\"undo()\">\n          <i class=\"fas fa-undo\"></i>\n        </b-button>\n        <b-button title=\"Redo\" squared class=\"toolbar-btn undo-redo-btn\" :disabled=\"!this.canRedo\" v-on:click=\"redo()\">\n          <i class=\"fas fa-redo\"></i>\n        </b-button>\n      </b-button-group>\n\n      <b-button-group>\n        <b-button title=\"Inspect\" squared class=\"toolbar-btn\" v-on:click=\"changeTool('inspect')\">\n          <i class=\"fas fa-hand-pointer\"></i>\n        </b-button>\n        <b-button title=\"Add wall\" squared class=\"toolbar-btn\" v-on:click=\"changeTool('create_wall')\" v-if=\"isAdmin\">\n          <svg class=\"svg-inline--fa fa-w-16\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 234.809 234.809\"\n               xml:space=\"preserve\">\n                    <path fill=\"currentColor\" d=\"M7.5,53.988c-4.135,0-7.5-3.364-7.5-7.5V20.571c0-4.136,3.365-7.5,7.5-7.5h94.904c4.135,0,7.5,3.364,7.5,7.5v25.917\n                      c0,4.136-3.365,7.5-7.5,7.5H7.5z M227.309,53.988c4.135,0,7.5-3.364,7.5-7.5V20.571c0-4.136-3.365-7.5-7.5-7.5h-94.904\n                      c-4.135,0-7.5,3.364-7.5,7.5v25.917c0,4.136,3.365,7.5,7.5,7.5H227.309z M164.856,109.904c4.135,0,7.5-3.365,7.5-7.5V76.488\n                      c0-4.136-3.365-7.5-7.5-7.5H69.952c-4.135,0-7.5,3.364-7.5,7.5v25.917c0,4.135,3.365,7.5,7.5,7.5H164.856z M39.952,109.904\n                      c4.136,0,7.5-3.364,7.5-7.5V76.488c0-4.136-3.364-7.5-7.5-7.5H8.048c-4.136,0-7.5,3.364-7.5,7.5v25.917c0,4.136,3.364,7.5,7.5,7.5\n                      H39.952z M226.761,109.904c4.136,0,7.5-3.364,7.5-7.5V76.488c0-4.136-3.364-7.5-7.5-7.5h-31.904c-4.136,0-7.5,3.364-7.5,7.5v25.917\n                      c0,4.136,3.364,7.5,7.5,7.5H226.761z M102.404,165.821c4.135,0,7.5-3.364,7.5-7.5v-25.917c0-4.135-3.365-7.5-7.5-7.5H7.5\n                      c-4.135,0-7.5,3.365-7.5,7.5v25.917c0,4.136,3.365,7.5,7.5,7.5H102.404z M227.309,165.821c4.135,0,7.5-3.364,7.5-7.5v-25.917\n                      c0-4.135-3.365-7.5-7.5-7.5h-94.904c-4.135,0-7.5,3.365-7.5,7.5v25.917c0,4.136,3.365,7.5,7.5,7.5H227.309z M164.856,221.738\n                      c4.135,0,7.5-3.364,7.5-7.5v-25.917c0-4.136-3.365-7.5-7.5-7.5H69.952c-4.135,0-7.5,3.364-7.5,7.5v25.917c0,4.136,3.365,7.5,7.5,7.5\n                      H164.856z M39.952,221.738c4.136,0,7.5-3.364,7.5-7.5v-25.917c0-4.136-3.364-7.5-7.5-7.5H8.048c-4.136,0-7.5,3.364-7.5,7.5v25.917\n                      c0,4.136,3.364,7.5,7.5,7.5H39.952z M226.761,221.738c4.136,0,7.5-3.364,7.5-7.5v-25.917c0-4.136-3.364-7.5-7.5-7.5h-31.904\n                      c-4.136,0-7.5,3.364-7.5,7.5v25.917c0,4.136,3.364,7.5,7.5,7.5H226.761z\"/>\n                  </svg>\n        </b-button>\n        <b-button title=\"Add object\" squared class=\"toolbar-btn\" v-on:click=\"changeTool('create_prop')\" v-if=\"isAdmin\">\n          <i class=\"fas fa-plus\"></i>\n        </b-button>\n        <b-button title=\"Add pin\" squared class=\"toolbar-btn\" v-on:click=\"changeTool('create_pin')\" v-if=\"isAdmin\">\n          <i class=\"fas fa-thumbtack\"></i>\n        </b-button>\n        <b-button title=\"Edit grid\" squared class=\"toolbar-btn\" v-on:click=\"changeTool('grid')\" v-if=\"isAdmin\">\n          <i class=\"fas fa-border-all\"/>\n        </b-button>\n        <b-button title=\"Light settings\" squared class=\"toolbar-btn\" v-on:click=\"changeTool('light')\" v-if=\"isAdmin\">\n          <i class=\"fas fa-lightbulb\"/>\n        </b-button>\n      </b-button-group>\n      <b-button title=\"Export map\" squared variant=\"success\" class=\"btn-xs\" v-on:click=\"phase.exportMap()\"\n                v-if=\"isAdmin\">\n        <i class=\"fas fa-download\"/>\n      </b-button>\n\n      <div style=\"flex: 1 1 0;\"/> <!-- Spacing -->\n      <b-button title=\"Toggle sidebar\" variant=\"warning\" class=\"btn-xs\" v-b-toggle.sidebar-right>\n        <i class=\"fas fa-angle-double-right\"/>\n      </b-button>\n    </b-button-toolbar>\n\n\n    <div id=\"canvas-container\" style=\"width: 100%; height: calc(100vh - var(--topbar-height));\">\n\n    </div>\n\n    <!----------------------------------------------------------------------------------------      SIDEBAR      -->\n\n    <b-sidebar id=\"sidebar-right\" title=\"Sidebar\"\n               bg-variant=\"dark\" text-variant=\"light\" right visible no-header shadow\n               sidebar-class=\"under-navbar\">\n      <!----------------------------------      GRID CONTROL      ---------------------------------->\n      <grid-edit class=\"px-3 py-2\" v-show=\"tool === 'grid'\" v-bind:world=\"world\"/>\n      <!----------------------------------      ENTITY INSPECTOR      ---------------------------------->\n      <div v-show=\"tool === 'inspect'\">\n        <entity-inspect\n            v-bind:components=\"this.selectedComponents\"\n            v-bind:entity=\"this.selectedEntityOpts\"\n            v-bind:isAdmin=\"isAdmin\"\n            v-bind:selectedAddable=\"selectedAddable\"\n            @ecs-property-change=\"onEcsPropertyChange\"/>\n      </div>\n      <!----------------------------------      LIGHT SETTINGS      ---------------------------------->\n      <div class=\"px-3 py-2\" v-show=\"tool === 'light'\">\n        <div class=\"d-flex flex-row align-items-center\">\n          <div class=\"\">Light:</div>\n          <b-input type=\"color\" v-model=\"light.ambientLight\" :readonly=\"!isAdmin\"\n                   @change=\"onAmbientLightChange\"></b-input>\n        </div>\n        <div class=\"d-flex flex-row align-items-center\">\n          <div class=\"\">Needs light:</div>\n          <b-form-checkbox v-model=\"light.needsLight\" @input=\"onAmbientLightChange\"\n                           :readonly=\"!isAdmin\"></b-form-checkbox>\n        </div>\n        <div class=\"d-flex flex-row align-items-center\">\n          <div class=\"\">Vision type:</div>\n          <b-button :pressed.sync=\"light.roleplayVision\" :readonly=\"!isAdmin\">\n            {{ light.roleplayVision ? \"Roleplayer\" : \"Master\" }}\n          </b-button>\n        </div>\n        <div class=\"d-flex flex-row align-items-center\">\n          <div class=\"\">Background:</div>\n          <b-input type=\"color\" v-model=\"light.background\" :readonly=\"!isAdmin\"\n                   @change=\"onAmbientLightChange\"></b-input>\n        </div>\n        <div>\n          <b-button @click=\"onLightSettingsReset\">Reset</b-button>\n        </div>\n      </div>\n\n      <template v-slot:footer>\n        <div class=\"sidebar-footer\">\n          {{ connectionCount }}\n          <div v-bind:class=\"{ rotate: connectionBuffering }\" style=\"margin-left: 0.2rem\">\n            <i class=\"fas fa-sync-alt\"></i>\n          </div>\n        </div>\n      </template>\n    </b-sidebar>\n\n    <a id=\"hidden-download-link\" style=\"display: none;\"/>\n  </div>\n</template>\n\n<script lang=\"ts\">\nimport Vue from \"vue\";\n\nimport EntityInspect from \"../ecs/entityInspect.vue\";\nimport {Component} from \"../../ecs/component\";\nimport {Resource} from \"../../ecs/resource\";\nimport {AddComponent} from \"../../ecs/systems/selectionSystem\";\nimport {DEFAULT_LIGHT_SETTINGS, LightSettings, LocalLightSettings} from \"../../ecs/systems/lightSystem\";\nimport {SelectionSystem} from \"../../ecs/systems/selectionSystem\";\nimport PIXI from \"../../PIXI\";\nimport hex2string = PIXI.utils.hex2string;\nimport string2hex = PIXI.utils.string2hex;\nimport {Tool} from \"../../ecs/tools/toolType\";\nimport {ToolResource} from \"../../ecs/systems/toolSystem\";\nimport GridEdit from \"./gridEdit.vue\";\n\nexport default Vue.extend({\n  components: {GridEdit, EntityInspect},\n  props: ['phase', 'world', 'isAdmin'],\n  data() {\n    return {\n      tool: 'inspect',\n      connectionCount: 0,\n      connectionBuffering: false,\n      light: {\n        ambientLight: '#000000',\n        needsLight: true,\n        roleplayVision: false,\n        background: '#000000'\n      },\n      selectedComponents: new Array<Component>(),\n      selectedEntityOpts: {},\n      selectedAddable: new Array<AddComponent>(),\n      canUndo: false,\n      canRedo: false,\n    };\n  },\n  methods: {\n    changeTool(tool: Tool) {\n      this.phase.world.editResource('tool', {tool});\n    },\n\n    onEcsPropertyChange(type: string, property: string, value: any, multiId: number) {\n      let selectionSys = this.phase.world.systems.get('selection') as SelectionSystem;\n      selectionSys.setProperty(type, property, value, multiId);\n    },\n\n    onAmbientLightChange() {\n      this.phase.world.addResource({\n        type: 'light_settings',\n        ambientLight: string2hex(this.light.ambientLight),\n        needsLight: this.light.needsLight,\n        background: string2hex(this.light.background),\n      } as LightSettings, 'update');\n    },\n    onLightSettingsReset() {\n      this.phase.world.addResource(Object.assign({\n        type: 'light_settings',\n      }, DEFAULT_LIGHT_SETTINGS) as LightSettings, 'update');\n      this.reloadLight();\n    },\n    reloadLight() {\n      let light = this.phase.world.getResource('light_settings') as LightSettings;\n      this.light.ambientLight = hex2string(light.ambientLight);\n      this.light.needsLight = light.needsLight;\n      this.light.background = hex2string(light.background);\n      let llight = this.phase.world.getResource('local_light_settings') as LocalLightSettings;\n      this.light.roleplayVision = llight.visionType === 'rp';\n    },\n    onResourceEdited(res: Resource) {\n      if (res.type === 'light_settings' || res.type === 'local_light_settings') this.reloadLight();\n      else if (res.type === 'tool') this.tool = (res as ToolResource).tool!;\n    },\n    undo() {\n      this.phase.world.events.emit('command_undo');\n    },\n    redo() {\n      this.phase.world.events.emit('command_redo');\n    }\n  },\n  watch: {\n    'light.roleplayVision': function () {\n      let visionType = this.light.roleplayVision ? 'rp' : 'dm';\n\n      this.phase.world.editResource('local_light_settings', {visionType});\n    }\n  },\n  mounted() {\n    //this.world = this.phase.world;\n    this.reloadLight();\n\n    this.phase.world.events.on('resource_edited', this.onResourceEdited);\n  },\n  /*unmounted() {// TODO: vue3\n    this.phase.world.events.off('resource_edited', this.onResourceEdited);\n  },*/\n});\n</script>\n\n<style scoped>\n.game {\n  user-select: none;\n}\n\n.toolbar-btn {\n  color: #fff;\n  background-color: #2C3E50;\n  border-color: #2C3E50;\n}\n\n.sidebar-footer {\n  display: flex;\n  align-items: center;\n  justify-content: right;\n}\n\n.undo-redo-btn.disabled, .undo-redo-btn:disabled {\n  background-color: #343a40;\n  border-color: #343a40;\n  box-shadow: none;\n}\n</style>\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/footer.vue?vue&type=style&index=0&id=539f2bff&scoped=true&lang=css&":
/*!**************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/footer.vue?vue&type=style&index=0&id=539f2bff&scoped=true&lang=css& ***!
  \**************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _public_images_GitHub_Mark_Light_32px_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../public/images/GitHub-Mark-Light-32px.png */ "./src/public/images/GitHub-Mark-Light-32px.png");
// Imports




var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_public_images_GitHub_Mark_Light_32px_png__WEBPACK_IMPORTED_MODULE_3__.default);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "\n.credits[data-v-539f2bff] {\n  text-align: right;\n  padding: 20px;\n}\n.github[data-v-539f2bff] {\n  display: inline-block;\n  width: 32px;\n  height: 32px;\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n}\n.github[data-v-539f2bff]:hover {\n  opacity: 0.5;\n}\n.profile[data-v-539f2bff] {\n  color: white;\n}\n.profile[data-v-539f2bff]:hover {\n  opacity: 0.5;\n}\n\n", "",{"version":3,"sources":["webpack://./src/app/ui/footer.vue"],"names":[],"mappings":";AAqBA;EACA,iBAAA;EACA,aAAA;AACA;AAEA;EACA,qBAAA;EACA,WAAA;EACA,YAAA;EACA,yDAAA;AACA;AAEA;EACA,YAAA;AACA;AAEA;EACA,YAAA;AACA;AAEA;EACA,YAAA;AACA","sourcesContent":["<template>\n  <div class=\"footer\">\n    <div class=\"credits\">\n      <div class=\"links\">\n        <a href=\"https://github.com/SnowyCoder/dndme\" target=\"_blank\" class=\"github\"></a>\n      </div>\n      <small style=\"color: lightgray\">\n        Developed by <a href=\"https://github.com/SnowyCoder\" target=\"_blank\" class=\"profile\">Rossi Lorenzo</a> /\n        Drawings by <span style=\"color: white\">Giorgia Nizzoli</span>\n      </small>\n    </div>\n  </div>\n</template>\n\n<script lang=\"ts\">\nimport Vue from \"vue\";\n\nexport default Vue.extend({});\n</script>\n\n<style scoped>\n.credits {\n  text-align: right;\n  padding: 20px;\n}\n\n.github {\n  display: inline-block;\n  width: 32px;\n  height: 32px;\n  background-image: url(\"~Public/images/GitHub-Mark-Light-32px.png\");\n}\n\n.github:hover {\n  opacity: 0.5;\n}\n\n.profile {\n  color: white;\n}\n\n.profile:hover {\n  opacity: 0.5;\n}\n\n</style>\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/home.vue?vue&type=style&index=0&lang=css&":
/*!*****************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/home.vue?vue&type=style&index=0&lang=css& ***!
  \*****************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "\n.s-home-container {\n  color: white;\n}\n.s-home-text {\n  color: white;\n}\n.btn-entry {\n  margin-bottom: 10px;\n}\n\n", "",{"version":3,"sources":["webpack://./src/app/ui/home/home.vue"],"names":[],"mappings":";AA0EA;EACA,YAAA;AACA;AAEA;EACA,YAAA;AACA;AAEA;EACA,mBAAA;AACA","sourcesContent":["<template>\n  <div class=\"phase-container text-center flex-column align-items-center justify-content-center row\" style=\"height: 100vh; margin: 0;\">\n    <div class=\"text-white\">\n      <p class=\"title\" style=\"font-size: 3.5em; margin: 0;\">DRAW&DICE</p>\n      <p class=\"\" style=\"font-size: 2em;\">Dnd made ez!</p>\n    </div>\n\n    <div>\n      <b-button variant=\"warning\" size=\"lg\" class=\"btn-entry\" v-on:click=\"onCreateMap\">Create Map</b-button>\n    </div>\n    <div>\n      <b-button variant=\"info\" size=\"lg\" class=\"btn-entry\" v-on:click=\"onEditMap\">Edit Map</b-button>\n    </div>\n\n    <b-modal ref=\"map-load-modal\" hide-footer title=\"Gimme the map\">\n      <b-form-file\n          v-model=\"file\"\n          :state=\"Boolean(file)\"\n          placeholder=\"Choose a file or drop it here...\"\n          drop-placeholder=\"Drop file here...\"\n          accept=\".dndm\"\n      ></b-form-file>\n    </b-modal>\n\n    <footer-component></footer-component>\n  </div>\n</template>\n\n<script lang=\"ts\">\nimport FooterComponent from \"../footer.vue\";\nimport MapInput from \"./mapInput.vue\";\n\n\nimport {VComponent, Vue, PhaseVue, VWatch, VRef} from \"../vue\";\nimport EventEmitter = PIXI.utils.EventEmitter;\nimport {BModal} from \"bootstrap-vue\";\n\n@VComponent({\n  components: { MapInput, FooterComponent }\n})\nexport default class HomeComponent extends Vue implements PhaseVue {\n  @VRef('map-load-modal') readonly mapLoadModal!: BModal;\n\n  file: any = null;\n  pendingOp: string = \"\";\n  eventEmitter!: EventEmitter;\n\n  onCreateMap() {\n    this.eventEmitter.emit(\"create_map\");\n  }\n\n  onEditMap() {\n    this.pendingOp = 'edit';\n    this.mapLoadModal.show();\n    this.eventEmitter.emit(\"edit_map\");\n  }\n\n  mapLoadCancel() {\n    this.mapLoadModal.hide();\n  }\n\n  @VWatch('file')\n  onFileChanged(val: any) {\n    if (val == null) return;\n\n    console.log(\"File dropped, loading: \" + this.pendingOp);\n    this.eventEmitter.emit(this.pendingOp, this.file);\n    this.file = null;\n    this.mapLoadCancel();\n  }\n}\n</script>\n\n<style>\n.s-home-container {\n  color: white;\n}\n\n.s-home-text {\n  color: white;\n}\n\n.btn-entry {\n  margin-bottom: 10px;\n}\n\n</style>\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/loading/loading.vue?vue&type=style&index=0&lang=css&":
/*!***********************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/loading/loading.vue?vue&type=style&index=0&lang=css& ***!
  \***********************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "\n.sloading-container {\n  color: white;\n  height: 100vh;\n\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-direction: column;\n}\n.sloading-title {\n  font-size: 5em;\n}\n", "",{"version":3,"sources":["webpack://./src/app/ui/loading/loading.vue"],"names":[],"mappings":";AAwCA;EACA,YAAA;EACA,aAAA;;EAEA,aAAA;EACA,mBAAA;EACA,uBAAA;EACA,sBAAA;AACA;AACA;EACA,cAAA;AACA","sourcesContent":["<template>\n  <div>\n    <div class=\"sloading-container\">\n      <h1 class=\"sloading-title\">DRAW&DICE</h1>\n      <h2>{{message}}</h2>\n      <h5>Loading</h5>\n    </div>\n  </div>\n</template>\n\n<script lang=\"ts\">\nimport Vue from \"vue\";\nimport {VComponent} from \"../vue\";\n\nconst LOADING_PHRASES = [\n  \"Persuading dragons to cooperate...\",\n  \"A Dwarf, an Elf and a Dragonbord enter a tavern... \\\"We're looking for a quest\\\"\",\n  \"An ancient legend tells that if you insult a dragon to exhaustion... they'll eat you anyways\",\n  \"Recharging spell slots...\",\n  \"Roll a Charisma saving throw...\",\n  \"Long rest in progress...\",\n  \"Fitting out the goblin army...\",\n  \"The last boss you killed met a 20th level chieric... The rest is up to you! ;)\",\n  \"This map only costs 25gp!\",\n  \"Sorry, you'd better create a new character sheet\",\n];\n\nfunction randomMex() {\n  const i = Math.floor(Math.random() * LOADING_PHRASES.length);\n  return LOADING_PHRASES[i];\n}\n\n@VComponent\nexport default class Loading extends Vue {\n  message = randomMex();\n}\n\n</script>\n\n<style>\n  .sloading-container {\n    color: white;\n    height: 100vh;\n\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    flex-direction: column;\n  }\n  .sloading-title {\n    font-size: 5em;\n  }\n</style>\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/public/style.css":
/*!********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/public/style.css ***!
  \********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_bootstrap_dist_css_bootstrap_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! -!../../node_modules/css-loader/dist/cjs.js!../../node_modules/bootstrap/dist/css/bootstrap.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/bootstrap/dist/css/bootstrap.css");
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_bootstrap_vue_dist_bootstrap_vue_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! -!../../node_modules/css-loader/dist/cjs.js!../../node_modules/bootstrap-vue/dist/bootstrap-vue.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/bootstrap-vue/dist/bootstrap-vue.css");
// Imports




var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Merienda+One&display=swap);"]);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_node_modules_bootstrap_dist_css_bootstrap_css__WEBPACK_IMPORTED_MODULE_2__.default);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_node_modules_bootstrap_vue_dist_bootstrap_vue_css__WEBPACK_IMPORTED_MODULE_3__.default);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ":root {\n    --topbar-height: 40px;\n}\n\n* {\n    font-family: 'Merienda One', cursive;\n}\n\nbody {\n    color: white;\n\n    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAPklEQVQoU2NkYGAwZmBgOMsAASD2cwYGhmcwPiOUIcXAwCCJpBDOhynA0AkzCaQA2QoMk0AKQIJwO+nvBmMAk2YWvDhYBRoAAAAASUVORK5CYII=);\n    background-color: #6e472c !important;\n}\n\n.phase-container {\n}\n\n.footer {\n    position: fixed;\n    bottom: 0;\n}\n\n\n@media screen and (max-height: 600px) {\n    .footer {\n        position: static;\n    }\n}\n\n.under-navbar {\n    margin-top: var(--topbar-height) !important;\n}\n\ndiv.under-navbar {\n    margin-top: var(--topbar-height) !important;\n}\n\n.b-sidebar.under-navbar {\n    height: calc(100vh - var(--topbar-height));\n}\n\n.footer, .game-footer {\n    width: 100%;\n    background-color: rgba(0, 0, 0, 0.25);\n}\n\n.btn-xs {\n    padding: .25rem .4rem;\n    font-size: .875rem;\n    line-height: .5;\n    border-radius: .2rem;\n}\n\n.modal-fullscreen {\n    height: 92%;\n}\n.modal-fullscreen .modal-content {\n    height: 100%;\n}\n.modal-xxl {\n    width: 92% !important;\n    max-width: 92% !important;\n}\n\n#canvas-container canvas {\n    vertical-align: top;\n}\n\n.rotate {\n    animation: rotation 1s infinite linear;\n}\n\n/** ANIMATIONS **/\n\n@keyframes rotation {\n    from {\n        transform: rotate(0deg);\n    }\n    to {\n        transform: rotate(359deg);\n    }\n}\n\n\n", "",{"version":3,"sources":["webpack://./src/public/style.css"],"names":[],"mappings":"AAIA;IACI,qBAAqB;AACzB;;AAEA;IACI,oCAAoC;AACxC;;AAEA;IACI,YAAY;;IAEZ,6MAA6M;IAC7M,oCAAoC;AACxC;;AAEA;AACA;;AAEA;IACI,eAAe;IACf,SAAS;AACb;;;AAGA;IACI;QACI,gBAAgB;IACpB;AACJ;;AAEA;IACI,2CAA2C;AAC/C;;AAEA;IACI,2CAA2C;AAC/C;;AAEA;IACI,0CAA0C;AAC9C;;AAEA;IACI,WAAW;IACX,qCAAqC;AACzC;;AAEA;IACI,qBAAqB;IACrB,kBAAkB;IAClB,eAAe;IACf,oBAAoB;AACxB;;AAEA;IACI,WAAW;AACf;AACA;IACI,YAAY;AAChB;AACA;IACI,qBAAqB;IACrB,yBAAyB;AAC7B;;AAEA;IACI,mBAAmB;AACvB;;AAEA;IACI,sCAAsC;AAC1C;;AAEA,iBAAiB;;AAEjB;IACI;QACI,uBAAuB;IAC3B;IACA;QACI,yBAAyB;IAC7B;AACJ","sourcesContent":["@import url('https://fonts.googleapis.com/css2?family=Merienda+One&display=swap');\n@import '~bootstrap/dist/css/bootstrap.css';\n@import '~bootstrap-vue/dist/bootstrap-vue.css';\n\n:root {\n    --topbar-height: 40px;\n}\n\n* {\n    font-family: 'Merienda One', cursive;\n}\n\nbody {\n    color: white;\n\n    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAPklEQVQoU2NkYGAwZmBgOMsAASD2cwYGhmcwPiOUIcXAwCCJpBDOhynA0AkzCaQA2QoMk0AKQIJwO+nvBmMAk2YWvDhYBRoAAAAASUVORK5CYII=);\n    background-color: #6e472c !important;\n}\n\n.phase-container {\n}\n\n.footer {\n    position: fixed;\n    bottom: 0;\n}\n\n\n@media screen and (max-height: 600px) {\n    .footer {\n        position: static;\n    }\n}\n\n.under-navbar {\n    margin-top: var(--topbar-height) !important;\n}\n\ndiv.under-navbar {\n    margin-top: var(--topbar-height) !important;\n}\n\n.b-sidebar.under-navbar {\n    height: calc(100vh - var(--topbar-height));\n}\n\n.footer, .game-footer {\n    width: 100%;\n    background-color: rgba(0, 0, 0, 0.25);\n}\n\n.btn-xs {\n    padding: .25rem .4rem;\n    font-size: .875rem;\n    line-height: .5;\n    border-radius: .2rem;\n}\n\n.modal-fullscreen {\n    height: 92%;\n}\n.modal-fullscreen .modal-content {\n    height: 100%;\n}\n.modal-xxl {\n    width: 92% !important;\n    max-width: 92% !important;\n}\n\n#canvas-container canvas {\n    vertical-align: top;\n}\n\n.rotate {\n    animation: rotation 1s infinite linear;\n}\n\n/** ANIMATIONS **/\n\n@keyframes rotation {\n    from {\n        transform: rotate(0deg);\n    }\n    to {\n        transform: rotate(359deg);\n    }\n}\n\n\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./src/public/images/GitHub-Mark-Light-32px.png":
/*!******************************************************!*\
  !*** ./src/public/images/GitHub-Mark-Light-32px.png ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "266ca63177bca6f330a74e83fdc63178.png");

/***/ }),

/***/ "./src/public/images/props.png":
/*!*************************************!*\
  !*** ./src/public/images/props.png ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "461f357929f9f8d63da20b81e743a099.png");

/***/ }),

/***/ "./node_modules/peerjs/dist sync recursive":
/*!****************************************!*\
  !*** ./node_modules/peerjs/dist/ sync ***!
  \****************************************/
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = "./node_modules/peerjs/dist sync recursive";
module.exports = webpackEmptyContext;

/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/compWrapper.vue?vue&type=script&lang=ts&":
/*!*******************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/compWrapper.vue?vue&type=script&lang=ts& ***!
  \*******************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecsName_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecsName.vue */ "./src/app/ui/ecs/ecsName.vue");
/* harmony import */ var _ecsNote_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ecsNote.vue */ "./src/app/ui/ecs/ecsNote.vue");
/* harmony import */ var _ecsPosition_vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ecsPosition.vue */ "./src/app/ui/ecs/ecsPosition.vue");
/* harmony import */ var _ecsWall_vue__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ecsWall.vue */ "./src/app/ui/ecs/ecsWall.vue");
/* harmony import */ var _ecsBackgroundImage_vue__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ecsBackgroundImage.vue */ "./src/app/ui/ecs/ecsBackgroundImage.vue");
/* harmony import */ var _ecsPin_vue__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ecsPin.vue */ "./src/app/ui/ecs/ecsPin.vue");
/* harmony import */ var _ecsTransform_vue__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ecsTransform.vue */ "./src/app/ui/ecs/ecsTransform.vue");
/* harmony import */ var _ecsLight_vue__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ecsLight.vue */ "./src/app/ui/ecs/ecsLight.vue");
/* harmony import */ var _ecsPlayer_vue__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ecsPlayer.vue */ "./src/app/ui/ecs/ecsPlayer.vue");
/* harmony import */ var _ecsDoor_vue__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ecsDoor.vue */ "./src/app/ui/ecs/ecsDoor.vue");
/* harmony import */ var _ecsPropTeleport_vue__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./ecsPropTeleport.vue */ "./src/app/ui/ecs/ecsPropTeleport.vue");
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};












let EcsComponentWrapper = class EcsComponentWrapper extends _vue__WEBPACK_IMPORTED_MODULE_11__.Vue {
    constructor() {
        super(...arguments);
        this.visible = true;
    }
    get componentType() {
        return 'ecs-' + this.component.type.replace('_', '-');
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_11__.VProp)({ required: true })
], EcsComponentWrapper.prototype, "component", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_11__.VProp)({ default: false })
], EcsComponentWrapper.prototype, "isAdmin", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_11__.VProp)()
], EcsComponentWrapper.prototype, "allComps", void 0);
EcsComponentWrapper = __decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_11__.VComponent)({
        components: {
            ecsName: _ecsName_vue__WEBPACK_IMPORTED_MODULE_0__.default, ecsNote: _ecsNote_vue__WEBPACK_IMPORTED_MODULE_1__.default, ecsPosition: _ecsPosition_vue__WEBPACK_IMPORTED_MODULE_2__.default, ecsWall: _ecsWall_vue__WEBPACK_IMPORTED_MODULE_3__.default, ecsBackgroundImage: _ecsBackgroundImage_vue__WEBPACK_IMPORTED_MODULE_4__.default, ecsPin: _ecsPin_vue__WEBPACK_IMPORTED_MODULE_5__.default, ecsTransform: _ecsTransform_vue__WEBPACK_IMPORTED_MODULE_6__.default, ecsLight: _ecsLight_vue__WEBPACK_IMPORTED_MODULE_7__.default, ecsPlayer: _ecsPlayer_vue__WEBPACK_IMPORTED_MODULE_8__.default, ecsDoor: _ecsDoor_vue__WEBPACK_IMPORTED_MODULE_9__.default,
            ecsPropTeleport: _ecsPropTeleport_vue__WEBPACK_IMPORTED_MODULE_10__.default
        }
    })
], EcsComponentWrapper);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcsComponentWrapper);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsBackgroundImage.vue?vue&type=script&lang=ts&":
/*!**************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsBackgroundImage.vue?vue&type=script&lang=ts& ***!
  \**************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let EcsBackgroundImage = class EcsBackgroundImage extends _vue__WEBPACK_IMPORTED_MODULE_0__.Vue {
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsBackgroundImage.prototype, "component", void 0);
EcsBackgroundImage = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_0__.VComponent
], EcsBackgroundImage);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcsBackgroundImage);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsDoor.vue?vue&type=script&lang=ts&":
/*!***************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsDoor.vue?vue&type=script&lang=ts& ***!
  \***************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecs_systems_doorSystem__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../ecs/systems/doorSystem */ "./src/app/ecs/systems/doorSystem.ts");
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


let EcsDoor = class EcsDoor extends _vue__WEBPACK_IMPORTED_MODULE_1__.Vue {
    constructor() {
        super(...arguments);
        this.doorType = _ecs_systems_doorSystem__WEBPACK_IMPORTED_MODULE_0__.DoorType.NORMAL_RIGHT;
        this.open = false;
        this.locked = false;
    }
    onChange() {
        if (this.component.doorType !== this.doorType) {
            this.$emit('ecs-property-change', 'door', 'doorType', this.doorType);
        }
        if (this.component.open !== this.open) {
            this.$emit('ecs-property-change', 'door', 'open', this.open);
        }
        if (this.component.locked !== this.locked) {
            this.$emit('ecs-property-change', 'door', 'locked', this.locked);
        }
    }
    get doorTypeName() {
        switch (this.doorType) {
            case _ecs_systems_doorSystem__WEBPACK_IMPORTED_MODULE_0__.DoorType.NORMAL_LEFT:
                return "Normal";
            case _ecs_systems_doorSystem__WEBPACK_IMPORTED_MODULE_0__.DoorType.NORMAL_RIGHT:
                return "Normal right";
            case _ecs_systems_doorSystem__WEBPACK_IMPORTED_MODULE_0__.DoorType.ROTATE:
                return "Rotating";
            default:
                return "Unknown??";
        }
    }
    onCDoorTypeChanged(val) {
        this.doorType = val;
    }
    onCOpenChanged(val) {
        this.open = val;
    }
    onCLockedChanged(val) {
        this.locked = val;
    }
    onDoorTypeChanged() {
        this.onChange();
    }
    onOpenChanged() {
        this.onChange();
    }
    onLockedChanged() {
        this.onChange();
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VProp)({ required: true })
], EcsDoor.prototype, "component", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VProp)({ required: true })
], EcsDoor.prototype, "isAdmin", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VWatchImmediate)('component.doorType')
], EcsDoor.prototype, "onCDoorTypeChanged", null);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VWatchImmediate)('component.open')
], EcsDoor.prototype, "onCOpenChanged", null);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VWatchImmediate)('component.locked')
], EcsDoor.prototype, "onCLockedChanged", null);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VWatch)('doorType')
], EcsDoor.prototype, "onDoorTypeChanged", null);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VWatch)('open')
], EcsDoor.prototype, "onOpenChanged", null);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VWatch)('locked')
], EcsDoor.prototype, "onLockedChanged", null);
EcsDoor = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_1__.VComponent
], EcsDoor);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcsDoor);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsLight.vue?vue&type=script&lang=ts&":
/*!****************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsLight.vue?vue&type=script&lang=ts& ***!
  \****************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


var hex2string = _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.utils.hex2string;
var string2hex = _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.utils.string2hex;
let EcsLight = class EcsLight extends _vue__WEBPACK_IMPORTED_MODULE_1__.Vue {
    constructor() {
        super(...arguments);
        this.color = '';
        this.range = '';
    }
    onChange() {
        let c = string2hex(this.color);
        if (this.component.color !== c && this.color !== '') {
            this.$emit('ecs-property-change', 'light', 'color', c);
        }
        let r = parseInt(this.range);
        if (this.component.range !== r && this.range !== '') {
            this.$emit('ecs-property-change', 'light', 'range', r);
        }
    }
    onCColorChanged(val) {
        this.color = val === undefined ? '' : hex2string(val);
    }
    onCRangeChanged(val) {
        this.range = (val !== null && val !== void 0 ? val : '') + '';
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VProp)({ required: true })
], EcsLight.prototype, "component", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VProp)({ required: true })
], EcsLight.prototype, "isAdmin", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VWatchImmediate)('component.color')
], EcsLight.prototype, "onCColorChanged", null);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VWatchImmediate)('component.range')
], EcsLight.prototype, "onCRangeChanged", null);
EcsLight = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_1__.VComponent
], EcsLight);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcsLight);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsName.vue?vue&type=script&lang=ts&":
/*!***************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsName.vue?vue&type=script&lang=ts& ***!
  \***************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let EcsName = class EcsName extends _vue__WEBPACK_IMPORTED_MODULE_0__.Vue {
    constructor() {
        super(...arguments);
        this.name = '';
    }
    onCNameChanged(val) {
        this.name = val !== null && val !== void 0 ? val : '';
    }
    onChange() {
        this.$emit('ecs-property-change', 'name', 'name', this.name, this.component.multiId);
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsName.prototype, "component", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsName.prototype, "isAdmin", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VWatchImmediate)('component.name')
], EcsName.prototype, "onCNameChanged", null);
EcsName = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_0__.VComponent
], EcsName);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcsName);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsNote.vue?vue&type=script&lang=ts&":
/*!***************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsNote.vue?vue&type=script&lang=ts& ***!
  \***************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let EcsNote = class EcsNote extends _vue__WEBPACK_IMPORTED_MODULE_0__.Vue {
    constructor() {
        super(...arguments);
        this.note = '';
    }
    onCNoteChanged(val) {
        this.note = val;
    }
    onChange() {
        this.$emit('ecs-property-change', 'note', 'note', this.note, this.component.multiId);
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsNote.prototype, "component", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsNote.prototype, "isAdmin", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VWatchImmediate)('component.note')
], EcsNote.prototype, "onCNoteChanged", null);
EcsNote = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_0__.VComponent
], EcsNote);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcsNote);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPin.vue?vue&type=script&lang=ts&":
/*!**************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPin.vue?vue&type=script&lang=ts& ***!
  \**************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


var hex2string = _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.utils.hex2string;
var string2hex = _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.utils.string2hex;
let EcsPin = class EcsPin extends _vue__WEBPACK_IMPORTED_MODULE_1__.Vue {
    constructor() {
        super(...arguments);
        this.color = '';
        this.label = '';
    }
    onChange() {
        let c = string2hex(this.color);
        if (this.component.color !== c && this.color !== '') {
            this.$emit('ecs-property-change', 'pin', 'color', c);
        }
        let label = this.label;
        if (!label)
            label = undefined;
        if (label !== this.component.label) {
            this.$emit('ecs-property-change', 'pin', 'label', label);
        }
    }
    onCColorChanged(val) {
        this.color = val === undefined ? "" : hex2string(val);
    }
    onCLabelChanged(val) {
        this.label = val !== null && val !== void 0 ? val : "";
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VProp)({ required: true })
], EcsPin.prototype, "component", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VProp)({ required: true })
], EcsPin.prototype, "isAdmin", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VWatchImmediate)('component.color')
], EcsPin.prototype, "onCColorChanged", null);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VWatchImmediate)('component.label')
], EcsPin.prototype, "onCLabelChanged", null);
EcsPin = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_1__.VComponent
], EcsPin);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcsPin);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPlayer.vue?vue&type=script&lang=ts&":
/*!*****************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPlayer.vue?vue&type=script&lang=ts& ***!
  \*****************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let EcsPlayer = class EcsPlayer extends _vue__WEBPACK_IMPORTED_MODULE_0__.Vue {
    constructor() {
        super(...arguments);
        this.nightVision = false;
        this.range = '';
    }
    onChange() {
        if (this.component.nightVision !== this.nightVision) {
            this.$emit('ecs-property-change', 'player', 'nightVision', this.nightVision);
        }
        let c = parseInt(this.range);
        if (this.component.range !== c && this.range !== '') {
            this.$emit('ecs-property-change', 'player', 'range', c);
        }
    }
    onCNightVisionChanged(val) {
        this.nightVision = val;
    }
    onCRangeChanged(val) {
        this.range = val + '';
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsPlayer.prototype, "component", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsPlayer.prototype, "isAdmin", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VWatchImmediate)('component.nightVision')
], EcsPlayer.prototype, "onCNightVisionChanged", null);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VWatchImmediate)('component.range')
], EcsPlayer.prototype, "onCRangeChanged", null);
EcsPlayer = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_0__.VComponent
], EcsPlayer);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcsPlayer);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPosition.vue?vue&type=script&lang=ts&":
/*!*******************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPosition.vue?vue&type=script&lang=ts& ***!
  \*******************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let EcsPosition = class EcsPosition extends _vue__WEBPACK_IMPORTED_MODULE_0__.Vue {
    constructor() {
        super(...arguments);
        this.x = '';
        this.y = '';
    }
    onChange() {
        let x = parseFloat(this.x);
        if (this.component.x !== x && this.x !== '') {
            this.$emit('ecs-property-change', 'position', 'x', x);
        }
        let y = parseFloat(this.y);
        if (this.component.y !== y && this.y !== '') {
            this.$emit('ecs-property-change', 'position', 'y', y);
        }
    }
    onCxChanged(val) {
        this.x = (val !== null && val !== void 0 ? val : '') + '';
    }
    onCyChanged(val) {
        this.y = (val !== null && val !== void 0 ? val : '') + '';
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsPosition.prototype, "component", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsPosition.prototype, "isAdmin", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VWatchImmediate)('component.x')
], EcsPosition.prototype, "onCxChanged", null);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VWatchImmediate)('component.y')
], EcsPosition.prototype, "onCyChanged", null);
EcsPosition = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_0__.VComponent
], EcsPosition);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcsPosition);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPropTeleport.vue?vue&type=script&lang=ts&":
/*!***********************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPropTeleport.vue?vue&type=script&lang=ts& ***!
  \***********************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let EcsPropTeleport = class EcsPropTeleport extends _vue__WEBPACK_IMPORTED_MODULE_0__.Vue {
    focusTarget() {
        console.warn("TODO: focus target");
    }
    link() {
        this.$emit('ecs-property-change', '@', 'prop_teleport_link', this.component.entity);
    }
    use() {
        this.$emit('ecs-property-change', '@', 'prop_use', this.component.entity);
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsPropTeleport.prototype, "component", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsPropTeleport.prototype, "isAdmin", void 0);
EcsPropTeleport = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_0__.VComponent
], EcsPropTeleport);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcsPropTeleport);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsTransform.vue?vue&type=script&lang=ts&":
/*!********************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsTransform.vue?vue&type=script&lang=ts& ***!
  \********************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var pixi_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/pixi.es.js");
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


let EcsTransform = class EcsTransform extends _vue__WEBPACK_IMPORTED_MODULE_1__.Vue {
    constructor() {
        super(...arguments);
        this.rotation = '';
        this.scale = '';
    }
    onChange() {
        if (this.rotation !== '') {
            let r = Math.min(Math.max(parseFloat(this.rotation), 0), 360);
            if (this.component.rotation !== r) {
                this.$emit('ecs-property-change', 'transform', 'rotation', r * pixi_js__WEBPACK_IMPORTED_MODULE_0__.DEG_TO_RAD);
            }
        }
        if (this.scale !== '') {
            let s = parseFloat(this.scale);
            if (this.component.scale !== s) {
                this.$emit('ecs-property-change', 'transform', 'scale', s);
            }
        }
    }
    onCRotationChanged(val) {
        this.rotation = (val !== null && val !== void 0 ? val : 0) * pixi_js__WEBPACK_IMPORTED_MODULE_0__.RAD_TO_DEG + '';
    }
    onCScaleChanged(val) {
        this.scale = (val !== null && val !== void 0 ? val : 0) + '';
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VProp)({ required: true })
], EcsTransform.prototype, "component", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VProp)({ required: true })
], EcsTransform.prototype, "isAdmin", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VWatchImmediate)('component.rotation')
], EcsTransform.prototype, "onCRotationChanged", null);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VWatchImmediate)('component.scale')
], EcsTransform.prototype, "onCScaleChanged", null);
EcsTransform = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_1__.VComponent
], EcsTransform);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcsTransform);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsWall.vue?vue&type=script&lang=ts&":
/*!***************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsWall.vue?vue&type=script&lang=ts& ***!
  \***************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let EcsWall = class EcsWall extends _vue__WEBPACK_IMPORTED_MODULE_0__.Vue {
    constructor() {
        super(...arguments);
        this.w = '';
        this.h = '';
    }
    onChange() {
        let w = parseFloat(this.w);
        let h = parseFloat(this.h);
        if ((this.component.vec[0] !== w && this.w !== '') || (this.component.vec[1] !== h && this.h !== '')) {
            this.$emit('ecs-property-change', 'wall', 'vec', [w, h]);
        }
    }
    onCxChanged(vec) {
        if (vec === undefined) {
            this.w = '';
            this.h = '';
        }
        else {
            this.w = vec[0] + '';
            this.h = vec[1] + '';
        }
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsWall.prototype, "component", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], EcsWall.prototype, "isAdmin", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VWatchImmediate)('component.vec')
], EcsWall.prototype, "onCxChanged", null);
EcsWall = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_0__.VComponent
], EcsWall);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcsWall);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/entityInspect.vue?vue&type=script&lang=ts&":
/*!*********************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/entityInspect.vue?vue&type=script&lang=ts& ***!
  \*********************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _compWrapper_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./compWrapper.vue */ "./src/app/ui/ecs/compWrapper.vue");
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


let EntityInspect = class EntityInspect extends _vue__WEBPACK_IMPORTED_MODULE_1__.Vue {
    get renderedComponents() {
        return this.components.filter((c) => c._save && c._sync);
    }
    get allComponents() {
        let m = {};
        for (let c of this.components) {
            m[c.type] = c;
        }
        return m;
    }
    emitSpecial(name, par) {
        this.$emit('ecs-property-change', '$', name, par);
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VProp)({ required: true })
], EntityInspect.prototype, "entity", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VProp)({ required: true })
], EntityInspect.prototype, "components", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VProp)({ required: true })
], EntityInspect.prototype, "isAdmin", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VProp)({ required: true })
], EntityInspect.prototype, "selectedAddable", void 0);
EntityInspect = __decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_1__.VComponent)({
        components: {
            EcsComponentWrapper: _compWrapper_vue__WEBPACK_IMPORTED_MODULE_0__.default,
        }
    })
], EntityInspect);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EntityInspect);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/editMap.vue?vue&type=script&lang=ts&":
/*!****************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/editMap.vue?vue&type=script&lang=ts& ***!
  \****************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.esm.js");
/* harmony import */ var _ecs_entityInspect_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ecs/entityInspect.vue */ "./src/app/ui/ecs/entityInspect.vue");
/* harmony import */ var _ecs_systems_lightSystem__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../ecs/systems/lightSystem */ "./src/app/ecs/systems/lightSystem.ts");
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _gridEdit_vue__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./gridEdit.vue */ "./src/app/ui/edit/gridEdit.vue");




var hex2string = _PIXI__WEBPACK_IMPORTED_MODULE_2__.default.utils.hex2string;
var string2hex = _PIXI__WEBPACK_IMPORTED_MODULE_2__.default.utils.string2hex;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (vue__WEBPACK_IMPORTED_MODULE_4__.default.extend({
    components: { GridEdit: _gridEdit_vue__WEBPACK_IMPORTED_MODULE_3__.default, EntityInspect: _ecs_entityInspect_vue__WEBPACK_IMPORTED_MODULE_0__.default },
    props: ['phase', 'world', 'isAdmin'],
    data() {
        return {
            tool: 'inspect',
            connectionCount: 0,
            connectionBuffering: false,
            light: {
                ambientLight: '#000000',
                needsLight: true,
                roleplayVision: false,
                background: '#000000'
            },
            selectedComponents: new Array(),
            selectedEntityOpts: {},
            selectedAddable: new Array(),
            canUndo: false,
            canRedo: false,
        };
    },
    methods: {
        changeTool(tool) {
            this.phase.world.editResource('tool', { tool });
        },
        onEcsPropertyChange(type, property, value, multiId) {
            let selectionSys = this.phase.world.systems.get('selection');
            selectionSys.setProperty(type, property, value, multiId);
        },
        onAmbientLightChange() {
            this.phase.world.addResource({
                type: 'light_settings',
                ambientLight: string2hex(this.light.ambientLight),
                needsLight: this.light.needsLight,
                background: string2hex(this.light.background),
            }, 'update');
        },
        onLightSettingsReset() {
            this.phase.world.addResource(Object.assign({
                type: 'light_settings',
            }, _ecs_systems_lightSystem__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_LIGHT_SETTINGS), 'update');
            this.reloadLight();
        },
        reloadLight() {
            let light = this.phase.world.getResource('light_settings');
            this.light.ambientLight = hex2string(light.ambientLight);
            this.light.needsLight = light.needsLight;
            this.light.background = hex2string(light.background);
            let llight = this.phase.world.getResource('local_light_settings');
            this.light.roleplayVision = llight.visionType === 'rp';
        },
        onResourceEdited(res) {
            if (res.type === 'light_settings' || res.type === 'local_light_settings')
                this.reloadLight();
            else if (res.type === 'tool')
                this.tool = res.tool;
        },
        undo() {
            this.phase.world.events.emit('command_undo');
        },
        redo() {
            this.phase.world.events.emit('command_redo');
        }
    },
    watch: {
        'light.roleplayVision': function () {
            let visionType = this.light.roleplayVision ? 'rp' : 'dm';
            this.phase.world.editResource('local_light_settings', { visionType });
        }
    },
    mounted() {
        //this.world = this.phase.world;
        this.reloadLight();
        this.phase.world.events.on('resource_edited', this.onResourceEdited);
    },
    /*unmounted() {// TODO: vue3
      this.phase.world.events.off('resource_edited', this.onResourceEdited);
    },*/
}));


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/gridEdit.vue?vue&type=script&lang=ts&":
/*!*****************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/gridEdit.vue?vue&type=script&lang=ts& ***!
  \*****************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
/* harmony import */ var _game_grid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../game/grid */ "./src/app/game/grid.ts");
/* provided dependency */ var PIXI = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/pixi.es.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


var string2hex = PIXI.utils.string2hex;
var hex2string = PIXI.utils.hex2string;
let GridEdit = class GridEdit extends _vue__WEBPACK_IMPORTED_MODULE_0__.Vue {
    constructor() {
        super(...arguments);
        this.grid = {
            type: "none",
            size: 1,
            offX: 0,
            offY: 0,
            color: '#000000',
            opacity: 0.5,
            thick: 2,
        };
        this.disableWatchSave = false;
    }
    reloadGrid() {
        this.disableWatchSave = true;
        let grid = this.world.getResource('grid');
        switch (grid.gridType) {
            case _game_grid__WEBPACK_IMPORTED_MODULE_1__.GridType.HEXAGON:
                this.grid.type = 'hex';
                break;
            case _game_grid__WEBPACK_IMPORTED_MODULE_1__.GridType.SQUARE:
                this.grid.type = 'square';
                break;
        }
        if (!grid.visible) {
            this.grid.type = 'none';
        }
        let opts = grid;
        this.grid.size = opts.size;
        this.grid.offX = opts.offX;
        this.grid.offY = opts.offY;
        this.grid.color = hex2string(opts.color);
        this.grid.opacity = opts.opacity;
        this.grid.thick = opts.thick;
        this.disableWatchSave = false;
    }
    mounted() {
        this.reloadGrid();
        this.world.events.on('resource_edited', this.onResourceEdited, this);
    }
    unmounted() {
        this.world.events.off('resource_edited', this.onResourceEdited, this);
    }
    onResourceEdited(res) {
        if (res.type === 'grid')
            this.reloadGrid();
    }
    onGridChange(newGrid) {
        if (this.disableWatchSave)
            return;
        newGrid.offX = Math.min(newGrid.offX, newGrid.size);
        newGrid.offY = Math.min(newGrid.offY, newGrid.size);
        let type;
        switch (newGrid.type) {
            case 'none':
                type = undefined;
                break;
            case 'hex':
                type = _game_grid__WEBPACK_IMPORTED_MODULE_1__.GridType.HEXAGON;
                break;
            case 'square':
                type = _game_grid__WEBPACK_IMPORTED_MODULE_1__.GridType.SQUARE;
                break;
        }
        let cmd = {
            kind: 'redit',
            add: [], remove: [],
            edit: {},
        };
        if (type !== undefined) {
            cmd.edit['grid'] = {
                visible: true,
                gridType: type,
                size: newGrid.size,
                offX: newGrid.offX,
                offY: newGrid.offY,
                color: string2hex(newGrid.color),
                opacity: parseFloat(newGrid.opacity),
                thick: newGrid.thick,
            };
        }
        else {
            cmd.edit['grid'] = {
                visible: false,
            };
        }
        this.world.events.emit('command_log', cmd);
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VProp)({ required: true })
], GridEdit.prototype, "world", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_0__.VWatch)('grid', { deep: true })
], GridEdit.prototype, "onGridChange", null);
GridEdit = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_0__.VComponent
], GridEdit);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GridEdit);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/footer.vue?vue&type=script&lang=ts&":
/*!**********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/footer.vue?vue&type=script&lang=ts& ***!
  \**********************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.esm.js");

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (vue__WEBPACK_IMPORTED_MODULE_0__.default.extend({}));


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/home.vue?vue&type=script&lang=ts&":
/*!*************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/home.vue?vue&type=script&lang=ts& ***!
  \*************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _footer_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../footer.vue */ "./src/app/ui/footer.vue");
/* harmony import */ var _mapInput_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mapInput.vue */ "./src/app/ui/home/mapInput.vue");
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



let HomeComponent = class HomeComponent extends _vue__WEBPACK_IMPORTED_MODULE_2__.Vue {
    constructor() {
        super(...arguments);
        this.file = null;
        this.pendingOp = "";
    }
    onCreateMap() {
        this.eventEmitter.emit("create_map");
    }
    onEditMap() {
        this.pendingOp = 'edit';
        this.mapLoadModal.show();
        this.eventEmitter.emit("edit_map");
    }
    mapLoadCancel() {
        this.mapLoadModal.hide();
    }
    onFileChanged(val) {
        if (val == null)
            return;
        console.log("File dropped, loading: " + this.pendingOp);
        this.eventEmitter.emit(this.pendingOp, this.file);
        this.file = null;
        this.mapLoadCancel();
    }
};
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_2__.VRef)('map-load-modal')
], HomeComponent.prototype, "mapLoadModal", void 0);
__decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_2__.VWatch)('file')
], HomeComponent.prototype, "onFileChanged", null);
HomeComponent = __decorate([
    (0,_vue__WEBPACK_IMPORTED_MODULE_2__.VComponent)({
        components: { MapInput: _mapInput_vue__WEBPACK_IMPORTED_MODULE_1__.default, FooterComponent: _footer_vue__WEBPACK_IMPORTED_MODULE_0__.default }
    })
], HomeComponent);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HomeComponent);


/***/ }),

/***/ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/loading/loading.vue?vue&type=script&lang=ts&":
/*!*******************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/loading/loading.vue?vue&type=script&lang=ts& ***!
  \*******************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.esm.js");
/* harmony import */ var _vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vue */ "./src/app/ui/vue.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


const LOADING_PHRASES = [
    "Persuading dragons to cooperate...",
    "A Dwarf, an Elf and a Dragonbord enter a tavern... \"We're looking for a quest\"",
    "An ancient legend tells that if you insult a dragon to exhaustion... they'll eat you anyways",
    "Recharging spell slots...",
    "Roll a Charisma saving throw...",
    "Long rest in progress...",
    "Fitting out the goblin army...",
    "The last boss you killed met a 20th level chieric... The rest is up to you! ;)",
    "This map only costs 25gp!",
    "Sorry, you'd better create a new character sheet",
];
function randomMex() {
    const i = Math.floor(Math.random() * LOADING_PHRASES.length);
    return LOADING_PHRASES[i];
}
let Loading = class Loading extends vue__WEBPACK_IMPORTED_MODULE_1__.default {
    constructor() {
        super(...arguments);
        this.message = randomMex();
    }
};
Loading = __decorate([
    _vue__WEBPACK_IMPORTED_MODULE_0__.VComponent
], Loading);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Loading);


/***/ }),

/***/ "./src/app/PIXI.ts":
/*!*************************!*\
  !*** ./src/app/PIXI.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var pixi_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/pixi.es.js");
/* harmony import */ var pixi_layers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! pixi-layers */ "./node_modules/pixi-layers/dist/pixi-layers.js");
/* harmony import */ var pixi_layers__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(pixi_layers__WEBPACK_IMPORTED_MODULE_1__);


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (pixi_js__WEBPACK_IMPORTED_MODULE_0__);


/***/ }),

/***/ "./src/app/assetsLoader.ts":
/*!*********************************!*\
  !*** ./src/app/assetsLoader.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "loadAssets": () => (/* binding */ loadAssets)
/* harmony export */ });
/* harmony import */ var pixi_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/pixi.es.js");
/* harmony import */ var Public_images_props_png__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! Public/images/props.png */ "./src/public/images/props.png");
/* harmony import */ var Public_spritesheets_props_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! Public/spritesheets/props.json */ "./src/public/spritesheets/props.json");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



var BaseTexture = pixi_js__WEBPACK_IMPORTED_MODULE_0__.BaseTexture;
var ImageResource = pixi_js__WEBPACK_IMPORTED_MODULE_0__.resources.ImageResource;
function loadSpritesheet(loader, name, imgUrl, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            console.log("[Spritesheet] Loading: " + name);
            const imgElm = new Image();
            imgElm.crossOrigin = 'anonymous';
            imgElm.onload = () => {
                const tex = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Texture(new BaseTexture(new ImageResource(imgElm)));
                const spritesheet = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Spritesheet(tex, data);
                loader.resources[name] = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.LoaderResource(name, "");
                loader.resources[name].spritesheet = spritesheet;
                spritesheet.parse(() => {
                    console.log("[Spritesheet] Loaded: " + name);
                    resolve(spritesheet);
                });
            };
            imgElm.src = imgUrl; // When the listeners are set, we can finally start downloading the image.
        });
    });
}
function loadAssets() {
    return __awaiter(this, void 0, void 0, function* () {
        const loader = pixi_js__WEBPACK_IMPORTED_MODULE_0__.Loader.shared;
        yield Promise.all([
            loadSpritesheet(loader, "props", Public_images_props_png__WEBPACK_IMPORTED_MODULE_1__.default, Public_spritesheets_props_json__WEBPACK_IMPORTED_MODULE_2__),
        ]);
    });
}


/***/ }),

/***/ "./src/app/ecs/component.ts":
/*!**********************************!*\
  !*** ./src/app/ecs/component.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "POSITION_TYPE": () => (/* binding */ POSITION_TYPE),
/* harmony export */   "TRANSFORM_TYPE": () => (/* binding */ TRANSFORM_TYPE),
/* harmony export */   "NAME_TYPE": () => (/* binding */ NAME_TYPE),
/* harmony export */   "NOTE_TYPE": () => (/* binding */ NOTE_TYPE),
/* harmony export */   "FOLLOW_MOUSE_TYPE": () => (/* binding */ FOLLOW_MOUSE_TYPE),
/* harmony export */   "HOST_HIDDEN_TYPE": () => (/* binding */ HOST_HIDDEN_TYPE),
/* harmony export */   "registerCommonStorage": () => (/* binding */ registerCommonStorage)
/* harmony export */ });
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./storage */ "./src/app/ecs/storage.ts");

const POSITION_TYPE = "position";
const TRANSFORM_TYPE = "transform";
const NAME_TYPE = "name";
const NOTE_TYPE = "note";
const FOLLOW_MOUSE_TYPE = "follow_mouse";
const HOST_HIDDEN_TYPE = "host_hidden";
function registerCommonStorage(ecs) {
    ecs.addStorage(new _storage__WEBPACK_IMPORTED_MODULE_0__.SingleEcsStorage(POSITION_TYPE));
    ecs.addStorage(new _storage__WEBPACK_IMPORTED_MODULE_0__.SingleEcsStorage(TRANSFORM_TYPE));
    ecs.addStorage(new _storage__WEBPACK_IMPORTED_MODULE_0__.MultiEcsStorage(NAME_TYPE));
    ecs.addStorage(new _storage__WEBPACK_IMPORTED_MODULE_0__.MultiEcsStorage(NOTE_TYPE));
    ecs.addStorage(new _storage__WEBPACK_IMPORTED_MODULE_0__.FlagEcsStorage(FOLLOW_MOUSE_TYPE, false, false));
    ecs.addStorage(new _storage__WEBPACK_IMPORTED_MODULE_0__.FlagEcsStorage(HOST_HIDDEN_TYPE, false, false));
}


/***/ }),

/***/ "./src/app/ecs/ecsUtil.ts":
/*!********************************!*\
  !*** ./src/app/ecs/ecsUtil.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "filterComponentKeepEntity": () => (/* binding */ filterComponentKeepEntity),
/* harmony export */   "filterComponent": () => (/* binding */ filterComponent)
/* harmony export */ });
function filterComponentKeepEntity(comp) {
    let res = {};
    for (let name in comp) {
        if (name[0] === '_' || name === 'clientVisible')
            continue;
        res[name] = comp[name];
    }
    return res;
}
function filterComponent(comp) {
    let res = {};
    for (let name in comp) {
        if (name[0] === '_' || name === 'entity' || name === 'clientVisible')
            continue;
        res[name] = comp[name];
    }
    return res;
}


/***/ }),

/***/ "./src/app/ecs/interaction.ts":
/*!************************************!*\
  !*** ./src/app/ecs/interaction.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GeomertyQueryType": () => (/* binding */ GeomertyQueryType),
/* harmony export */   "QueryHitEvent": () => (/* binding */ QueryHitEvent)
/* harmony export */ });
/* harmony import */ var _geometry_aabb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../geometry/aabb */ "./src/app/geometry/aabb.ts");

var GeomertyQueryType;
(function (GeomertyQueryType) {
    GeomertyQueryType[GeomertyQueryType["POINT"] = 0] = "POINT";
    GeomertyQueryType[GeomertyQueryType["AABB"] = 1] = "AABB";
})(GeomertyQueryType || (GeomertyQueryType = {}));
class QueryHitEvent {
    constructor(type, multi, aabb, data) {
        this.hits = new Set();
        this.type = type;
        this.multi = multi;
        this.aabb = aabb;
        this.data = data || aabb;
    }
    shouldContinue() {
        return this.multi || this.hits.size === 0;
    }
    addHit(entity) {
        if (!this.shouldContinue())
            return;
        this.hits.add(entity);
    }
    static queryPoint(point, multi) {
        return new QueryHitEvent(GeomertyQueryType.POINT, multi, new _geometry_aabb__WEBPACK_IMPORTED_MODULE_0__.Aabb(point.x, point.y, point.x, point.y), point);
    }
    static queryAabb(aabb, multi) {
        return new QueryHitEvent(GeomertyQueryType.AABB, multi, aabb);
    }
}


/***/ }),

/***/ "./src/app/ecs/storage.ts":
/*!********************************!*\
  !*** ./src/app/ecs/storage.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "serializeObj": () => (/* binding */ serializeObj),
/* harmony export */   "MultiEcsStorage": () => (/* binding */ MultiEcsStorage),
/* harmony export */   "SingleEcsStorage": () => (/* binding */ SingleEcsStorage),
/* harmony export */   "FlagEcsStorage": () => (/* binding */ FlagEcsStorage)
/* harmony export */ });
function serializeObj(obj) {
    let res = {};
    for (let name in obj) {
        if (name[0] === '_' || name === 'entity' || name === 'type')
            continue;
        res[name] = obj[name];
    }
    return res;
}
class MultiEcsStorage {
    constructor(type, sync = true, save = true) {
        this.data = new Map();
        this.type = type;
        this.sync = sync;
        this.save = save;
    }
    getFirstComponent(entity, multiId) {
        if (multiId !== undefined) {
            return this.getComponent(entity, multiId);
        }
        let e = this.data.get(entity);
        if (e === undefined)
            return undefined;
        return e[0];
    }
    getComponent(entity, multiId) {
        let cmps = this.data.get(entity);
        if (cmps === undefined)
            return undefined;
        for (let cmp of cmps) {
            if (cmp.multiId === multiId)
                return cmp;
        }
        return undefined;
    }
    getComponents(entity) {
        if (entity !== undefined) {
            return this.data.get(entity) || [];
        }
        else {
            return this.allComponents();
        }
    }
    *allComponents() {
        for (let comps of this.data.values()) {
            for (let comp of comps) {
                yield comp;
            }
        }
    }
    register(component) {
        let arr = this.data.get(component.entity);
        if (component.multiId >= 0) { // Pre-assigned multi-id
            if (arr === undefined) {
                this.data.set(component.entity, [component]);
            }
            else {
                for (let c of arr) {
                    if (c.multiId === component.multiId)
                        throw 'Invalid pre-assigned multiId';
                }
                arr.push(component);
            }
            return;
        }
        if (arr === undefined) {
            component.multiId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            this.data.set(component.entity, [component]);
        }
        else {
            let id;
            let found;
            do {
                id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                found = false;
                for (let x of arr) {
                    if (x.multiId === id) {
                        found = true;
                        break;
                    }
                }
            } while (found);
            component.multiId = id;
            arr.push(component);
        }
    }
    unregister(component) {
        let arr = this.data.get(component.entity);
        if (arr === undefined) {
            return;
        }
        if (arr.length === 1 && arr[0] === component) {
            this.data.delete(component.entity);
        }
        else {
            arr.splice(arr.indexOf(component), 1);
        }
    }
    unregisterAllOf(entity) {
        this.data.delete(entity);
    }
    serialize() {
        let res = {};
        for (let [entity, comps] of this.data.entries()) {
            let entityRes = new Array();
            for (let component of comps) {
                entityRes.push(serializeObj(component));
            }
            res[entity] = entityRes;
        }
        return res;
    }
    serializeClient(shouldIgnore) {
        let res = {};
        for (let [entity, comps] of this.data.entries()) {
            if (shouldIgnore(entity))
                continue;
            let entityRes = new Array();
            for (let component of comps) {
                if (component.clientVisible === false)
                    continue;
                entityRes.push(serializeObj(component));
            }
            if (entityRes.length !== 0) {
                res[entity] = entityRes;
            }
        }
        return res;
    }
    deserialize(ecs, data) {
        for (let entity in data) {
            let e = parseInt(entity);
            for (let comp of data[entity]) {
                let obj = Object.assign({}, comp, {
                    type: this.type
                });
                ecs.addComponent(e, obj);
            }
        }
    }
}
class SingleEcsStorage {
    constructor(type, sync = true, save = true) {
        this.data = new Map();
        this.type = type;
        this.sync = sync;
        this.save = save;
    }
    getComponent(entity) {
        return this.data.get(entity);
    }
    getFirstComponent(entity) {
        return this.data.get(entity);
    }
    getComponents(entity) {
        if (entity !== undefined) {
            let res = this.data.get(entity);
            if (res === undefined)
                return [];
            else
                return [res];
        }
        else {
            return this.allComponents();
        }
    }
    allComponents() {
        return this.data.values();
    }
    register(component) {
        let arr = this.data.get(component.entity);
        if (arr === undefined) {
            this.data.set(component.entity, component);
        }
        else {
            throw 'Component of same type already registered';
        }
    }
    unregister(component) {
        let c = this.data.get(component.entity);
        if (c === undefined) {
            return;
        }
        if (c === component) {
            this.data.delete(component.entity);
        }
    }
    unregisterAllOf(entity) {
        this.data.delete(entity);
    }
    serialize() {
        let res = {};
        for (let comp of this.data.values()) {
            res[comp.entity] = serializeObj(comp);
        }
        return res;
    }
    serializeClient(shouldIgnore) {
        let res = {};
        for (let comp of this.data.values()) {
            if (shouldIgnore(comp.entity) || comp.clientVisible === false)
                continue;
            res[comp.entity] = serializeObj(comp);
        }
        return res;
    }
    deserialize(ecs, data) {
        for (let entity in data) {
            let obj = Object.assign({}, data[entity], {
                type: this.type
            });
            ecs.addComponent(parseInt(entity), obj);
        }
    }
}
class FlagEcsStorage {
    constructor(type, sync = true, save = true) {
        this.data = new Map();
        this.type = type;
        this.sync = sync;
        this.save = save;
    }
    getComponent(entity) {
        return this.data.get(entity);
    }
    getFirstComponent(entity) {
        return this.getComponent(entity);
    }
    getComponents(entity) {
        if (entity !== undefined) {
            let res = this.getComponent(entity);
            if (res === undefined)
                return [];
            else
                return [res];
        }
        else {
            return this.allComponents();
        }
    }
    allComponents() {
        return this.data.values();
    }
    register(component) {
        if (this.data.has(component.entity))
            throw 'Component of same type already registered';
        this.data.set(component.entity, component);
    }
    unregister(component) {
        this.data.delete(component.entity);
    }
    unregisterAllOf(entity) {
        this.data.delete(entity);
    }
    serialize() {
        return [...this.data.keys()];
    }
    serializeClient(shouldIgnore) {
        return [...this.data.keys()].filter((e) => !shouldIgnore(e));
    }
    deserialize(ecs, data) {
        for (let entity of data) {
            ecs.addComponent(entity, {
                type: this.type,
                entity: -1
            });
        }
    }
}


/***/ }),

/***/ "./src/app/ecs/systemGraph.ts":
/*!************************************!*\
  !*** ./src/app/ecs/systemGraph.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SystemGraph": () => (/* binding */ SystemGraph)
/* harmony export */ });
class SystemGraph {
    constructor() {
        this.systemsByName = new Map();
        this.systems = new Array();
        this.unfulfilledDeps = new Set();
    }
    get(name) {
        return this.systemsByName.get(name);
    }
    register(system) {
        let depName = system.name;
        let unfulfilled = this.unfulfilledDeps.has(system.name);
        if (!unfulfilled && system.provides !== undefined) {
            for (let dep of system.provides) {
                depName = dep;
                unfulfilled = this.unfulfilledDeps.has(dep);
                if (unfulfilled)
                    break;
            }
        }
        if (unfulfilled) {
            throw `Some previous system optionally depended on ${depName}, please order your systems correctly`;
        }
        for (let dep of system.dependencies) {
            if (!this.systemsByName.has(dep))
                throw 'Unfulfilled dependency: ' + dep;
        }
        if (system.optionalDependencies !== undefined) {
            for (let dep of system.optionalDependencies) {
                if (this.systemsByName.has(dep))
                    continue;
                this.unfulfilledDeps.add(dep);
            }
        }
        let sys = this.systemsByName.get(system.name);
        if (sys != null) {
            if (sys.name === system.name)
                throw 'System name conflict';
            console.warn(`System ${system.name} has been already registered under ${sys.name}, overriding`);
        }
        this.systemsByName.set(system.name, system);
        this.systems.push(system);
        if (system.provides) {
            for (let prov of system.provides) {
                if (this.systemsByName.has(prov)) {
                    throw `Service ${prov} is already provided by ${this.systemsByName.get(prov).name}, cannot override with ${system.name}`;
                }
                this.systemsByName.set(prov, system);
            }
        }
    }
    [Symbol.iterator]() {
        return this.systems[Symbol.iterator]();
    }
    getAt(index) {
        return this.systems[index];
    }
    size() {
        return this.systems.length;
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/backgroundSystem.ts":
/*!*************************************************!*\
  !*** ./src/app/ecs/systems/backgroundSystem.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BACKGROUND_TYPE": () => (/* binding */ BACKGROUND_TYPE),
/* harmony export */   "BackgroundSystem": () => (/* binding */ BackgroundSystem)
/* harmony export */ });
/* harmony import */ var _util_pixi__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/pixi */ "./src/app/util/pixi.ts");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../storage */ "./src/app/ecs/storage.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../graphics */ "./src/app/graphics.ts");
/* harmony import */ var _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../phase/editMap/displayPrecedence */ "./src/app/phase/editMap/displayPrecedence.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




const BACKGROUND_TYPE = 'background_image';
class BackgroundSystem {
    constructor(world) {
        this.name = BACKGROUND_TYPE;
        this.dependencies = [_graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE];
        this.world = world;
        this.storage = new _storage__WEBPACK_IMPORTED_MODULE_1__.SingleEcsStorage(BACKGROUND_TYPE, true, true);
        this.world.addStorage(this.storage);
        this.world.events.on('component_add', this.onComponentAdd, this);
        this.world.events.on(_graphics__WEBPACK_IMPORTED_MODULE_2__.EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE, this.onRememberBBBUpdate, this);
    }
    onComponentAdd(c) {
        return __awaiter(this, void 0, void 0, function* () {
            if (c.type !== BACKGROUND_TYPE)
                return;
            let bkgImg = c;
            if (bkgImg.image.byteOffset !== 0) {
                // Copy array to remove offset (TODO: fix)
                // https://github.com/peers/peerjs/issues/715
                bkgImg.image = new Uint8Array(bkgImg.image);
            }
            if (bkgImg.visibilityMap !== undefined) {
                let res = new Uint8Array(bkgImg.visibilityMap); // Copy buffer (adjusts alignment)
                bkgImg.visibilityMap = new Uint32Array(res.buffer);
            }
            let tex = yield (0,_util_pixi__WEBPACK_IMPORTED_MODULE_0__.loadTexture)(bkgImg.image, bkgImg.imageType);
            this.world.addComponent(c.entity, {
                type: _graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE,
                interactive: true,
                entity: c.entity,
                display: {
                    type: _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.IMAGE,
                    ignore: false,
                    priority: _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_3__.DisplayPrecedence.BACKGROUND,
                    scale: _graphics__WEBPACK_IMPORTED_MODULE_2__.ImageScaleMode.REAL,
                    visib: _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.REMEMBER_BIT_BY_BIT,
                    visMap: bkgImg.visibilityMap,
                    texture: tex,
                    anchor: { x: 0.5, y: 0.5 },
                    tint: 0xFFFFFF,
                },
            });
        });
    }
    onRememberBBBUpdate(entities) {
        var _a, _b;
        let gstor = this.world.storages.get(_graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE);
        for (let e of entities) {
            let c = this.storage.getComponent(e);
            if (c === undefined)
                continue;
            c.visibilityMap = (_b = (_a = gstor.getComponent(e)) === null || _a === void 0 ? void 0 : _a.display) === null || _b === void 0 ? void 0 : _b.visMap;
        }
    }
    enable() {
    }
    destroy() {
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/command/command.ts":
/*!************************************************!*\
  !*** ./src/app/ecs/systems/command/command.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "executeAndLogCommand": () => (/* binding */ executeAndLogCommand)
/* harmony export */ });
/* harmony import */ var _commandSystem__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./commandSystem */ "./src/app/ecs/systems/command/commandSystem.ts");

function executeAndLogCommand(world, command) {
    let res = {};
    world.events.emit(_commandSystem__WEBPACK_IMPORTED_MODULE_0__.EVENT_COMMAND_LOG, command, res);
    return res.inverted;
}


/***/ }),

/***/ "./src/app/ecs/systems/command/commandHistorySystem.ts":
/*!*************************************************************!*\
  !*** ./src/app/ecs/systems/command/commandHistorySystem.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "COMMAND_HISTORY_TYPE": () => (/* binding */ COMMAND_HISTORY_TYPE),
/* harmony export */   "CommandHistorySystem": () => (/* binding */ CommandHistorySystem)
/* harmony export */ });
/* harmony import */ var _commandSystem__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./commandSystem */ "./src/app/ecs/systems/command/commandSystem.ts");

// TODO: add command limit
const COMMAND_HISTORY_TYPE = 'command_history';
class CommandHistorySystem {
    constructor(world) {
        this.name = COMMAND_HISTORY_TYPE;
        this.dependencies = [_commandSystem__WEBPACK_IMPORTED_MODULE_0__.COMMAND_TYPE];
        this.history = [];
        this.isLastPartial = false;
        this.index = 0;
        this.world = world;
        this.commandSys = this.world.systems.get(_commandSystem__WEBPACK_IMPORTED_MODULE_0__.COMMAND_TYPE);
        this.commandSys.logger = this.addLog.bind(this);
        this.world.events.on("command_undo", this.onUndo, this);
        this.world.events.on("command_redo", this.onRedo, this);
    }
    notifyHistoryChange() {
        this.world.events.emit("command_history_change", this.canUndo(), this.canRedo());
    }
    closePartial() {
        this.isLastPartial = false;
    }
    processPartial(cmd, partial) {
        if (this.isLastPartial && !partial) {
            this.isLastPartial = false;
            // continue, this is the last partial round
        }
        else {
            // it's not partial (but also the last one was also not a partial)
            if (!partial)
                return false;
            // the last one was not partial but this one is,
            // add the command to the queue and wait for the next
            if (!this.isLastPartial && partial) {
                this.isLastPartial = true;
                return false;
            }
        }
        let lastCmd = this.history[this.index - 1];
        if (cmd.kind !== lastCmd.kind) {
            console.warn("Warning: processing a partial with a wrong last kind, did you forget to log the last partial command");
            return false;
        }
        let kind = this.commandSys.getKind(cmd.kind);
        kind.merge(cmd, lastCmd);
        this.history[this.index - 1] = cmd;
        return true;
    }
    addLog(cmd, partial) {
        //console.log("LOG", JSON.stringify(cmd));
        if (cmd === undefined) {
            if (!partial) {
                this.closePartial();
            }
            return;
        }
        if (this.processPartial(cmd, partial)) {
            return;
        }
        if (this.history.length !== this.index) {
            this.history.length = this.index; // Clear redo commands
        }
        this.history.push(cmd);
        this.index += 1;
        this.notifyHistoryChange();
    }
    executeEmit(cmd) {
        let res = {};
        this.world.events.emit(_commandSystem__WEBPACK_IMPORTED_MODULE_0__.EVENT_COMMAND_EMIT, cmd, res);
        return res.inverted || { kind: 'none' };
    }
    onUndo() {
        if (this.index === 0) {
            console.log("Nothing to undo");
            return;
        }
        let i = this.index - 1;
        let cmd = this.history[i];
        //console.log("PRE_UNDO", JSON.stringify(this.history[i]));
        this.history[i] = this.executeEmit(cmd);
        //console.log("POST_UNDO", JSON.stringify(this.history[i]));
        this.index = i;
        this.notifyHistoryChange();
    }
    onRedo() {
        if (this.index === this.history.length) {
            console.log("Nothing to redo");
            return;
        }
        let i = this.index;
        let cmd = this.history[i];
        //console.log("PRE_REDO", JSON.stringify(this.history[i]));
        this.history[i] = this.executeEmit(cmd);
        //console.log("POST_REDO", JSON.stringify(this.history[i]));
        this.index = i + 1;
        this.notifyHistoryChange();
    }
    canRedo() {
        return this.history.length > this.index;
    }
    canUndo() {
        return this.index > 0;
    }
    enable() {
    }
    destroy() {
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/command/commandSystem.ts":
/*!******************************************************!*\
  !*** ./src/app/ecs/systems/command/commandSystem.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EVENT_COMMAND_EMIT": () => (/* binding */ EVENT_COMMAND_EMIT),
/* harmony export */   "EVENT_COMMAND_LOG": () => (/* binding */ EVENT_COMMAND_LOG),
/* harmony export */   "EVENT_COMMAND_PARTIAL_END": () => (/* binding */ EVENT_COMMAND_PARTIAL_END),
/* harmony export */   "COMMAND_TYPE": () => (/* binding */ COMMAND_TYPE),
/* harmony export */   "CommandSystem": () => (/* binding */ CommandSystem)
/* harmony export */ });
/* harmony import */ var _spawnCommand__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./spawnCommand */ "./src/app/ecs/systems/command/spawnCommand.ts");
/* harmony import */ var _despawnCommand__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./despawnCommand */ "./src/app/ecs/systems/command/despawnCommand.ts");
/* harmony import */ var _componentEdit__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./componentEdit */ "./src/app/ecs/systems/command/componentEdit.ts");
/* harmony import */ var _resourceEditCommand__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./resourceEditCommand */ "./src/app/ecs/systems/command/resourceEditCommand.ts");
/* harmony import */ var _eventCommand__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./eventCommand */ "./src/app/ecs/systems/command/eventCommand.ts");
/* harmony import */ var _noneCommand__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./noneCommand */ "./src/app/ecs/systems/command/noneCommand.ts");
/* harmony import */ var _networkSystem__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../networkSystem */ "./src/app/ecs/systems/networkSystem.ts");







const EVENT_COMMAND_EMIT = 'command_emit';
const EVENT_COMMAND_LOG = 'command_log';
const EVENT_COMMAND_PARTIAL_END = 'command_partial_end';
const COMMAND_TYPE = 'command';
class CommandSystem {
    constructor(world) {
        this.name = COMMAND_TYPE;
        this.dependencies = [];
        this.optionalDependencies = [_networkSystem__WEBPACK_IMPORTED_MODULE_6__.NETWORK_TYPE];
        this.logger = x => { };
        this.commands = new Map();
        this.world = world;
        this.registerDefaultCommands();
        this.world.events.on(EVENT_COMMAND_EMIT, this.onEmit, this);
        this.world.events.on(EVENT_COMMAND_LOG, this.onLog, this);
        this.world.events.on(EVENT_COMMAND_PARTIAL_END, this.onPartialEnd, this);
        this.networkSys = world.systems.get(_networkSystem__WEBPACK_IMPORTED_MODULE_6__.NETWORK_TYPE);
    }
    registerCommandKind(kind) {
        this.commands.set(kind.kind, kind);
    }
    registerDefaultCommands() {
        this.registerCommandKind(new _spawnCommand__WEBPACK_IMPORTED_MODULE_0__.SpawnCommandKind(this.world));
        this.registerCommandKind(new _despawnCommand__WEBPACK_IMPORTED_MODULE_1__.DeSpawnCommandKind(this.world));
        this.registerCommandKind(new _componentEdit__WEBPACK_IMPORTED_MODULE_2__.ComponentEditCommandKind(this.world));
        this.registerCommandKind(new _resourceEditCommand__WEBPACK_IMPORTED_MODULE_3__.ResourceEditCommandKind(this.world));
        this.registerCommandKind(new _eventCommand__WEBPACK_IMPORTED_MODULE_4__.EventCommandKind(this.world));
        this.registerCommandKind(new _noneCommand__WEBPACK_IMPORTED_MODULE_5__.NoneCommandKind());
    }
    onEmit(command, res, share) {
        var _a;
        let kind = this.commands.get(command.kind);
        if (kind === undefined) {
            console.warn("Error executing command: unknown kind " + kind);
            return undefined;
        }
        if (kind.isNull(command))
            return;
        //console.log("EMIT", JSON.stringify(command));
        if (((_a = this.networkSys) === null || _a === void 0 ? void 0 : _a.isOnline()) === true && (this.world.isMaster || share)) {
            let stripped = kind.stripClient(command);
            if (stripped.length !== 0) {
                this.world.events.emit("command_share", stripped);
            }
        }
        this.world.events.emit('command_pre_execute');
        let inv;
        try {
            inv = kind.applyInvert(command);
        }
        catch (e) {
            console.warn("Cannot apply command", command, e);
            inv = undefined;
        }
        if (res !== undefined) {
            res.inverted = inv;
        }
        this.world.events.emit('command_post_execute', inv);
    }
    onLog(command, res, partial = false) {
        let result = res || {};
        this.onEmit(command, result);
        if (result.inverted !== undefined) {
            let inv = result.inverted;
            let kind = this.commands.get(inv.kind);
            if (kind === undefined) {
                console.warn("Invalid inverted command! " + kind);
                return;
            }
            if (!kind.isNull(inv)) {
                this.logger(result.inverted, partial);
            }
        }
    }
    onPartialEnd() {
        this.logger(undefined, false);
    }
    getKind(kind) {
        return this.commands.get(kind);
    }
    enable() {
    }
    destroy() {
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/command/componentEdit.ts":
/*!******************************************************!*\
  !*** ./src/app/ecs/systems/command/componentEdit.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "componentEditCommand": () => (/* binding */ componentEditCommand),
/* harmony export */   "ComponentEditCommandKind": () => (/* binding */ ComponentEditCommandKind)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../component */ "./src/app/ecs/component.ts");
/* harmony import */ var _ecsUtil__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../ecsUtil */ "./src/app/ecs/ecsUtil.ts");


function componentEditCommand() {
    return {
        kind: 'cedit',
        add: [],
        edit: [],
        remove: [],
    };
}
class ComponentEditCommandKind {
    constructor(world) {
        this.kind = 'cedit';
        this.world = world;
    }
    applyInvert(cmd) {
        let inv = {
            kind: 'cedit',
            add: [],
            edit: [],
            remove: [],
        };
        for (let c of cmd.add) {
            inv.remove.push({
                entity: c.entity,
                type: c.type,
                multiId: c.multiId,
            });
            this.world.addComponent(c.entity, c);
        }
        for (let c of cmd.edit) {
            this.world.editComponent(c.entity, c.type, c.changes, c.multiId, false);
        }
        inv.edit = cmd.edit;
        for (let c of cmd.remove) {
            let component = this.world.getComponent(c.entity, c.type, c.multiId);
            if (component !== undefined) {
                this.world.removeComponent(component);
                inv.add.push((0,_ecsUtil__WEBPACK_IMPORTED_MODULE_1__.filterComponentKeepEntity)(component));
            }
        }
        return inv;
    }
    stripClient(cmd) {
        let host_hidden = cmd.add.filter(x => x.type === _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE).map(x => x.entity);
        let non_host_hidden = cmd.remove.filter(x => x.type === _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE).map(x => x.entity);
        let predicate = (x) => {
            if (x.clientVisible === false)
                return false;
            if (host_hidden.indexOf(x.entity) > -1)
                return false;
            if (non_host_hidden.indexOf(x.entity) > -1)
                return true;
            return this.world.getComponent(x.entity, _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE) === undefined;
        };
        // TODO: clientVisible
        let add = cmd.add.filter(predicate);
        let edit = cmd.edit.filter(predicate);
        let remove = cmd.remove.filter(x => x.type !== _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE && predicate(x));
        edit = edit.filter(x => {
            if (!('clientVisible' in x.changes))
                return true;
            let orig = this.world.getComponent(x.entity, x.type, x.multiId);
            if (orig === undefined)
                return false;
            if (x.changes.clientVisible === false && orig.clientVisible !== false) {
                remove.push({
                    entity: x.entity,
                    type: x.type,
                    multiId: x.multiId,
                });
            }
            else if (x.changes.clientVisible !== false && orig.clientVisible === false) {
                add.push((0,_ecsUtil__WEBPACK_IMPORTED_MODULE_1__.filterComponentKeepEntity)(orig));
            }
            return false;
        });
        let res = new Array();
        if (host_hidden.length !== 0) {
            res.push({
                kind: 'despawn',
                entities: host_hidden,
            });
        }
        if (non_host_hidden.length !== 0) {
            res.push({
                kind: 'spawn',
                entities: non_host_hidden.map(x => this.createEntitySpawnPacket(x)),
            });
        }
        if (add.length + edit.length + remove.length !== 0) {
            res.push({
                kind: 'cedit',
                add: add.map(clone),
                edit: edit.map(clone),
                remove: remove.map(clone),
            });
        }
        return res;
    }
    merge(to, from) {
        // TODO: from should remove entities added in to.
        //       handle entities edited in to but removed in from
        to.add.push(...from.add);
        to.remove.push(...from.remove);
        for (let x of from.edit) {
            let z = to.edit.find(y => x.entity === y.entity && x.type === y.type && x.multiId === y.multiId);
            if (z === undefined) {
                to.edit.push(x);
            }
            else {
                Object.assign(z.changes, x.changes);
            }
        }
        return true;
    }
    isNull(command) {
        if (command.add.length + command.remove.length !== 0)
            return false;
        for (let edit of command.edit) {
            for (let c in edit.changes) {
                return false;
            }
        }
        return true;
    }
    createEntitySpawnPacket(entity) {
        this.world.events.emit('serialize_entity', entity);
        let components = this.world.getAllComponents(entity);
        let comps = [];
        for (let comp of components) {
            if (this.shouldIgnoreComponent0(comp))
                continue;
            comps.push((0,_ecsUtil__WEBPACK_IMPORTED_MODULE_1__.filterComponent)(comp));
        }
        return {
            id: entity,
            components: comps,
        };
    }
    shouldIgnoreComponent0(component) {
        var _a;
        return (component.clientVisible === false) || !((_a = this.world.storages.get(component.type)) === null || _a === void 0 ? void 0 : _a.sync);
    }
}
// I hate JS
function clone(x) {
    return JSON.parse(JSON.stringify(x));
}


/***/ }),

/***/ "./src/app/ecs/systems/command/despawnCommand.ts":
/*!*******************************************************!*\
  !*** ./src/app/ecs/systems/command/despawnCommand.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DeSpawnCommandKind": () => (/* binding */ DeSpawnCommandKind)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../component */ "./src/app/ecs/component.ts");

class DeSpawnCommandKind {
    constructor(world) {
        this.kind = 'despawn';
        this.world = world;
    }
    applyInvert(cmd) {
        let saved = this.world.despawnEntitiesSave(cmd.entities);
        return {
            kind: 'spawn',
            entities: saved,
        };
    }
    stripClient(command) {
        let entities = command.entities.filter(x => this.world.getComponent(x, _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE) === undefined);
        if (entities.length === 0)
            return [];
        return [{
                kind: 'despawn',
                entities,
            }];
    }
    merge(to, from) {
        to.entities.push(...from.entities);
        return true;
    }
    isNull(command) {
        return command.entities.length === 0;
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/command/eventCommand.ts":
/*!*****************************************************!*\
  !*** ./src/app/ecs/systems/command/eventCommand.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventCommandKind": () => (/* binding */ EventCommandKind)
/* harmony export */ });
class EventCommandKind {
    constructor(world) {
        this.kind = 'event';
        this.world = world;
    }
    applyInvert(cmd) {
        this.world.events.emit(cmd.do.name, ...cmd.do.args);
        return {
            kind: 'event',
            do: cmd.undo,
            undo: cmd.do,
        };
    }
    stripClient(command) {
        return [command];
    }
    merge(to, from) {
        return false;
    }
    isNull(command) {
        return false;
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/command/noneCommand.ts":
/*!****************************************************!*\
  !*** ./src/app/ecs/systems/command/noneCommand.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NoneCommandKind": () => (/* binding */ NoneCommandKind)
/* harmony export */ });
class NoneCommandKind {
    constructor() {
        this.kind = 'none';
    }
    applyInvert(cmd) {
        return cmd;
    }
    stripClient(command) {
        return [];
    }
    merge(to, from) {
        return true;
    }
    isNull(command) {
        return true;
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/command/resourceEditCommand.ts":
/*!************************************************************!*\
  !*** ./src/app/ecs/systems/command/resourceEditCommand.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ResourceEditCommandKind": () => (/* binding */ ResourceEditCommandKind)
/* harmony export */ });
class ResourceEditCommandKind {
    constructor(world) {
        this.kind = 'redit';
        this.world = world;
    }
    applyInvert(cmd) {
        let inv = {
            kind: 'redit',
            add: [],
            edit: [],
            remove: [],
        };
        for (let c of cmd.add) {
            inv.remove.push(c.type);
            this.world.addResource(c);
        }
        for (let name in cmd.edit) {
            // Data gets swapped with the changes
            let data = cmd.edit[name];
            this.world.editResource(name, data);
        }
        inv.edit = cmd.edit;
        for (let c of cmd.remove) {
            let res = this.world.getResource(c);
            if (res === undefined)
                continue;
            inv.add.push(res);
            this.world.removeResource(c);
        }
        return inv;
    }
    stripClient(cmd) {
        var _a;
        let add = cmd.add.filter(x => x._sync);
        let edit = {};
        let editc = 0;
        for (let type in cmd.edit) {
            if ((_a = this.world.getResource(type)) === null || _a === void 0 ? void 0 : _a._sync) {
                editc += 1;
                edit[type] = cmd.edit[type];
            }
        }
        let remove = cmd.remove.filter(x => { var _a; return (_a = this.world.getResource(x)) === null || _a === void 0 ? void 0 : _a._sync; });
        if (add.length + editc + remove.length === 0) {
            return [];
        }
        return [{
                kind: 'redit',
                add, edit, remove,
            }];
    }
    merge(to, from) {
        to.add.push(...from.add);
        to.remove.push(...from.remove);
        for (let type in from.edit) {
            if (type in to.edit) {
                Object.assign(to.edit[type], from.edit[type]);
            }
            else {
                to.edit[type] = from.edit[type];
            }
        }
        return true;
    }
    isNull(command) {
        if (command.add.length + command.remove.length !== 0)
            return false;
        for (let type in command.edit) {
            for (let change in command.edit[type]) {
                return false;
            }
        }
        return true;
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/command/spawnCommand.ts":
/*!*****************************************************!*\
  !*** ./src/app/ecs/systems/command/spawnCommand.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SpawnCommandKind": () => (/* binding */ SpawnCommandKind)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../component */ "./src/app/ecs/component.ts");

class SpawnCommandKind {
    constructor(world) {
        this.kind = 'spawn';
        this.world = world;
    }
    applyInvert(cmd) {
        let entities = cmd.entities.map((x) => x.id);
        this.world.respawnEntities(cmd.entities);
        return {
            kind: 'despawn',
            entities: entities,
        };
    }
    stripClient(command) {
        let new_ents = command.entities.filter((x) => x.components.find((y) => y.type === _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE) === undefined);
        let map_ents = new_ents.map(x => {
            return {
                id: x.id,
                components: x.components.filter(x => x.clientVisible !== false),
            };
        });
        if (map_ents.length === 0) {
            return [];
        }
        return [{
                kind: 'spawn',
                entities: map_ents,
            }];
    }
    merge(to, from) {
        to.entities.push(...from.entities);
        return true;
    }
    isNull(command) {
        return command.entities.length === 0;
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/doorSystem.ts":
/*!*******************************************!*\
  !*** ./src/app/ecs/systems/doorSystem.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DoorType": () => (/* binding */ DoorType),
/* harmony export */   "DOOR_TYPE": () => (/* binding */ DOOR_TYPE),
/* harmony export */   "DoorSystem": () => (/* binding */ DoorSystem)
/* harmony export */ });
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../storage */ "./src/app/ecs/storage.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./src/app/ecs/component.ts");
/* harmony import */ var _util_pixi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/pixi */ "./src/app/util/pixi.ts");
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _geometry_line__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../geometry/line */ "./src/app/geometry/line.ts");
/* harmony import */ var _wallSystem__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./wallSystem */ "./src/app/ecs/systems/wallSystem.ts");
/* harmony import */ var _geometry_collision__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../geometry/collision */ "./src/app/geometry/collision.ts");
/* harmony import */ var _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../phase/editMap/displayPrecedence */ "./src/app/phase/editMap/displayPrecedence.ts");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../index */ "./src/app/index.ts");
/* harmony import */ var _pixiGraphicSystem__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./pixiGraphicSystem */ "./src/app/ecs/systems/pixiGraphicSystem.ts");
/* harmony import */ var _lightSystem__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./lightSystem */ "./src/app/ecs/systems/lightSystem.ts");
/* harmony import */ var _pixiBoardSystem__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./pixiBoardSystem */ "./src/app/ecs/systems/pixiBoardSystem.ts");












var DoorType;
(function (DoorType) {
    DoorType["NORMAL_LEFT"] = "normall";
    DoorType["NORMAL_RIGHT"] = "normalr";
    DoorType["ROTATE"] = "rotate";
})(DoorType || (DoorType = {}));
const DOOR_TYPE = 'door';
class DoorSystem {
    constructor(ecs) {
        this.name = DOOR_TYPE;
        this.dependencies = [_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_11__.PIXI_BOARD_TYPE, _wallSystem__WEBPACK_IMPORTED_MODULE_5__.WALL_TYPE];
        this.storage = new _storage__WEBPACK_IMPORTED_MODULE_0__.SingleEcsStorage(DOOR_TYPE, true, true);
        this.isMasterView = false;
        this.world = ecs;
        this.layer = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.display.Layer();
        this.displayContainer = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Container();
        this.pixiBoardSys = ecs.systems.get(_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_11__.PIXI_BOARD_TYPE);
        this.wallSys = ecs.systems.get(_wallSystem__WEBPACK_IMPORTED_MODULE_5__.WALL_TYPE);
        this.world.addStorage(this.storage);
        this.world.events.on('component_add', this.onComponentAdd, this);
        this.world.events.on('component_edited', this.onComponentEdited, this);
        this.world.events.on('component_remove', this.onComponentRemove, this);
        this.world.events.on('resource_edited', this.onResourceEdited, this);
    }
    redrawComponent(door) {
        var _a;
        let wall = this.world.getComponent(door.entity, _wallSystem__WEBPACK_IMPORTED_MODULE_5__.WALL_TYPE);
        let pos = this.world.getComponent(door.entity, _component__WEBPACK_IMPORTED_MODULE_1__.POSITION_TYPE);
        let visible = this.isMasterView || this.world.getComponent(door.entity, _pixiGraphicSystem__WEBPACK_IMPORTED_MODULE_9__.REMEMBER_TYPE) !== undefined;
        if (!visible) {
            (_a = door._display) === null || _a === void 0 ? void 0 : _a.clear();
            return;
        }
        // TODO: use interaction shape? (might bug out on translations)
        let line = new _geometry_line__WEBPACK_IMPORTED_MODULE_4__.Line(pos.x, pos.y, pos.x + wall.vec[0], pos.y + wall.vec[1]);
        this.drawLines(door, line);
    }
    drawLines(door, line) {
        let g = door._display;
        if (g === undefined)
            return;
        g.clear();
        g.lineStyle(2, 0, 0.5);
        switch (door.doorType) {
            case DoorType.NORMAL_LEFT: {
                let r = line.distance();
                let startAngle = Math.atan2(line.toY - line.fromY, line.toX - line.fromX);
                if (door.open)
                    startAngle -= Math.PI / 2;
                g.arc(line.fromX, line.fromY, r, startAngle, startAngle + Math.PI / 2);
                break;
            }
            case DoorType.NORMAL_RIGHT: {
                let r = line.distance();
                let startAngle = Math.atan2(line.fromY - line.toY, line.fromX - line.toX);
                if (!door.open)
                    startAngle -= Math.PI / 2;
                g.arc(line.toX, line.toY, r, startAngle, startAngle + Math.PI / 2);
                break;
            }
            case DoorType.ROTATE: {
                let r = line.distance() / 2;
                let cx = (line.fromX + line.toX) / 2;
                let cy = (line.fromY + line.toY) / 2;
                g.drawCircle(cx, cy, r);
                break;
            }
            default:
                console.warn("Unknown door type: " + door.doorType);
        }
    }
    openDoor(door, doorType, open) {
        var _a, _b, _c, _d;
        let wall = this.world.getComponent(door.entity, _wallSystem__WEBPACK_IMPORTED_MODULE_5__.WALL_TYPE);
        let pos = this.world.getComponent(door.entity, _component__WEBPACK_IMPORTED_MODULE_1__.POSITION_TYPE);
        let newPos = undefined;
        let newVec = undefined;
        switch (doorType) {
            case DoorType.NORMAL_LEFT: {
                newVec = (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_6__.rotatePointByOrig)({ x: 0, y: 0 }, Math.PI / 2 * (open ? -1 : 1), { x: wall.vec[0], y: wall.vec[1] });
                break;
            }
            case DoorType.NORMAL_RIGHT: {
                let angle = Math.PI / 2 * (open ? 1 : -1);
                newPos = (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_6__.rotatePointByOrig)({ x: pos.x + wall.vec[0], y: pos.y + wall.vec[1] }, angle, { x: pos.x, y: pos.y });
                newVec = (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_6__.rotatePointByOrig)({ x: 0, y: 0 }, angle, { x: wall.vec[0], y: wall.vec[1] });
                break;
            }
            case DoorType.ROTATE: {
                let hvx = wall.vec[0] / 2;
                let hvy = wall.vec[1] / 2;
                let origin = { x: pos.x + hvx, y: pos.y + hvy };
                let angle = Math.PI / 2 * (open ? 1 : -1);
                newPos = (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_6__.rotatePointByOrig)(origin, angle, { x: pos.x, y: pos.y });
                newVec = (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_6__.rotatePointByOrig)(origin, angle, { x: pos.x + wall.vec[0], y: pos.y + wall.vec[1] });
                newVec.x -= newPos.x;
                newVec.y -= newPos.y;
                break;
            }
            default:
                console.warn("Unknown door type: " + doorType);
        }
        let px = (_a = newPos === null || newPos === void 0 ? void 0 : newPos.x) !== null && _a !== void 0 ? _a : pos.x;
        let py = (_b = newPos === null || newPos === void 0 ? void 0 : newPos.y) !== null && _b !== void 0 ? _b : pos.y;
        let vx = (_c = newVec === null || newVec === void 0 ? void 0 : newVec.x) !== null && _c !== void 0 ? _c : wall.vec[0];
        let vy = (_d = newVec === null || newVec === void 0 ? void 0 : newVec.y) !== null && _d !== void 0 ? _d : wall.vec[1];
        let intersectWith = this.wallSys.queryIntersections(px, py, vx, vy);
        if (!(intersectWith.length === 0 || (intersectWith.length === 1 && intersectWith[0] === door.entity))) {
            console.log("Door stuck");
            // Collision, don't split the door pls.
            return false;
        }
        let changes = [];
        if (newPos !== undefined) {
            changes.push({
                type: _component__WEBPACK_IMPORTED_MODULE_1__.POSITION_TYPE,
                changes: {
                    x: newPos.x,
                    y: newPos.y,
                },
            });
        }
        if (newVec !== undefined) {
            changes.push({
                type: _wallSystem__WEBPACK_IMPORTED_MODULE_5__.WALL_TYPE,
                changes: {
                    vec: [newVec.x, newVec.y],
                },
            });
        }
        // Commit the edits at the same time to prevent the wall from being split
        // (if we commit position before rotation it might create an overlap situation that should
        // not be there).
        this.world.editComponentMultiple(door.entity, changes);
        return true;
    }
    onComponentAdd(comp) {
        if (comp.type === DOOR_TYPE) {
            let d = comp;
            d._display = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Graphics();
            this.displayContainer.addChild(d._display);
            // Do NOT re-open the door, if it is open it means that it has been loaded from file and the wall is
            // already in the "door open" state. Bad snowy, wtf were you thinking
            this.redrawComponent(d);
            let wall = this.world.getComponent(comp.entity, _wallSystem__WEBPACK_IMPORTED_MODULE_5__.WALL_TYPE);
            if (wall !== undefined)
                wall._dontMerge++;
        }
        else if (comp.type === _pixiGraphicSystem__WEBPACK_IMPORTED_MODULE_9__.REMEMBER_TYPE) {
            let door = this.storage.getComponent(comp.entity);
            if (door !== undefined) {
                this.redrawComponent(door);
            }
        }
    }
    onComponentEdited(comp, changed) {
        if (comp.type === DOOR_TYPE) {
            let d = comp;
            if ('open' in changed) {
                if (!this.openDoor(d, d.doorType, d.open)) {
                    // TODO: well, this does not work right with the GUI
                    d.open = !d.open;
                }
            }
            if ('doorType' in changed) {
                if (d.open) {
                    this.openDoor(d, changed['doorType'], false) && this.openDoor(d, d.doorType, true);
                }
            }
            this.redrawComponent(d);
        }
        else if (comp.type === 'wall') {
            let d = this.storage.getComponent(comp.entity);
            if (d !== undefined)
                this.redrawComponent(d);
        }
        else if (comp.type === 'position') {
            let d = this.storage.getComponent(comp.entity);
            if (d !== undefined)
                this.redrawComponent(d);
        }
    }
    onComponentRemove(comp) {
        var _a;
        if (comp.type === DOOR_TYPE) {
            let d = comp;
            if (d.open) {
                this.openDoor(d, d.doorType, false);
            }
            (_a = d._display) === null || _a === void 0 ? void 0 : _a.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_2__.DESTROY_ALL);
            let wall = this.world.getComponent(comp.entity, _wallSystem__WEBPACK_IMPORTED_MODULE_5__.WALL_TYPE);
            wall._dontMerge--;
        }
    }
    onResourceEdited(res, edited) {
        if (res.type === _lightSystem__WEBPACK_IMPORTED_MODULE_10__.LOCAL_LIGHT_SETTINGS_TYPE && 'visionType' in edited) {
            this.isMasterView = res.visionType !== 'rp';
            for (let c of this.storage.allComponents()) {
                this.redrawComponent(c);
            }
        }
    }
    enable() {
        var _a;
        this.layer.zIndex = _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_7__.DisplayPrecedence.WALL + 1;
        this.layer.interactive = false;
        _index__WEBPACK_IMPORTED_MODULE_8__.app.stage.addChild(this.layer);
        this.displayContainer.parentLayer = this.layer;
        this.displayContainer.interactive = false;
        this.displayContainer.interactiveChildren = false;
        this.pixiBoardSys.board.addChild(this.displayContainer);
        this.isMasterView = ((_a = this.world.getResource(_lightSystem__WEBPACK_IMPORTED_MODULE_10__.LOCAL_LIGHT_SETTINGS_TYPE)) === null || _a === void 0 ? void 0 : _a.visionType) !== 'rp';
    }
    destroy() {
        this.displayContainer.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_2__.DESTROY_ALL);
        this.layer.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_2__.DESTROY_ALL);
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/gridSystem.ts":
/*!*******************************************!*\
  !*** ./src/app/ecs/systems/gridSystem.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GRID_TYPE": () => (/* binding */ GRID_TYPE),
/* harmony export */   "GridSystem": () => (/* binding */ GridSystem)
/* harmony export */ });
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../index */ "./src/app/index.ts");
/* harmony import */ var _util_geometry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/geometry */ "./src/app/util/geometry.ts");
/* harmony import */ var _util_pixi__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../util/pixi */ "./src/app/util/pixi.ts");
/* harmony import */ var _game_grid__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../game/grid */ "./src/app/game/grid.ts");
/* harmony import */ var _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../phase/editMap/displayPrecedence */ "./src/app/phase/editMap/displayPrecedence.ts");
/* harmony import */ var _pixiBoardSystem__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./pixiBoardSystem */ "./src/app/ecs/systems/pixiBoardSystem.ts");
/* harmony import */ var _toolSystem__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./toolSystem */ "./src/app/ecs/systems/toolSystem.ts");
/* harmony import */ var _selectionSystem__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./selectionSystem */ "./src/app/ecs/systems/selectionSystem.ts");
/* harmony import */ var _tools_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../tools/utils */ "./src/app/ecs/tools/utils.ts");
/* harmony import */ var _tools_toolType__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../tools/toolType */ "./src/app/ecs/tools/toolType.ts");











const SQRT3 = Math.sqrt(3);
const GRID_TYPE = 'grid';
class GridSystem {
    constructor(world) {
        this.name = GRID_TYPE;
        this.dependencies = [_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_6__.PIXI_BOARD_TYPE, _selectionSystem__WEBPACK_IMPORTED_MODULE_8__.SELECTION_TYPE, _toolSystem__WEBPACK_IMPORTED_MODULE_7__.TOOL_TYPE];
        this.internalScale = 1;
        this.posX = 0;
        this.posY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.world = world;
        this.sprite = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.TilingSprite(_PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Texture.EMPTY, _index__WEBPACK_IMPORTED_MODULE_1__.app.screen.width, _index__WEBPACK_IMPORTED_MODULE_1__.app.screen.height);
        this.sprite.zIndex = _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_5__.DisplayPrecedence.GRID;
        let toolSys = world.systems.get(_toolSystem__WEBPACK_IMPORTED_MODULE_7__.TOOL_TYPE);
        toolSys.addTool((0,_tools_utils__WEBPACK_IMPORTED_MODULE_9__.createEmptyDriver)(_tools_toolType__WEBPACK_IMPORTED_MODULE_10__.Tool.GRID));
        world.events.on('resource_edited', this.onResourceEdited, this);
        world.events.on('resource_remove', this.onResourceRemove, this);
        this.gridRes = Object.assign({
            type: GRID_TYPE,
            _save: true,
            _sync: true,
        }, _game_grid__WEBPACK_IMPORTED_MODULE_4__.STANDARD_GRID_OPTIONS);
        world.addResource(this.gridRes);
        this.updateTex();
        this.updatePos();
    }
    onResourceEdited(res, changed) {
        if (res.type === GRID_TYPE) {
            // Redraw
            this.updateTex();
            this.updatePos();
        }
        else if (res.type === _pixiBoardSystem__WEBPACK_IMPORTED_MODULE_6__.BOARD_TRANSFORM_TYPE) {
            this.onBoardTransform(res);
        }
    }
    onResourceRemove(res) {
        if (res.type !== GRID_TYPE)
            return;
        throw 'Fool! Thou shall not remove thy grid!';
    }
    onBoardTransform(data) {
        this.posX = data.posX;
        this.posY = data.posY;
        this.scaleX = data.scaleX;
        this.scaleY = data.scaleY;
        this.updatePos();
    }
    onResize(width, height) {
        this.sprite.width = width;
        this.sprite.height = height;
    }
    updateTex() {
        this.sprite.texture.destroy(true);
        if (!this.gridRes.visible) {
            this.sprite.texture = _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Texture.EMPTY;
            return;
        }
        let tex = drawGridTexture(512, this.gridRes.gridType, this.gridRes);
        this.internalScale = this.gridRes.size / 512;
        this.sprite.texture = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Texture(tex);
    }
    updatePos() {
        this.sprite.tileScale.set(this.scaleX * this.internalScale, this.scaleY * this.internalScale);
        this.sprite.tilePosition.set(this.posX + this.scaleX * this.gridRes.offX * this.gridRes.size, this.posY + this.scaleY * this.gridRes.offY * this.gridRes.size);
    }
    closestPoint(point) {
        if (this.gridRes === undefined)
            return undefined;
        let pnt = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Point(point[0], point[1]);
        this.sprite.worldTransform.apply(pnt, pnt);
        let pointX = pnt.x / this.gridRes.size - this.gridRes.offX;
        let pointY = pnt.y / this.gridRes.size - this.gridRes.offY;
        let resX;
        let resY;
        switch (this.gridRes.gridType) {
            case _game_grid__WEBPACK_IMPORTED_MODULE_4__.GridType.SQUARE:
                {
                    let fx = Math.floor(pointX);
                    let fy = Math.floor(pointY);
                    resX = fx;
                    resY = fy;
                    if (pointX > fx + 0.5) {
                        resX += 1;
                    }
                    if (pointY > fy + 0.5) {
                        resY += 1;
                    }
                    // Also check grid center
                    if ((0,_util_geometry__WEBPACK_IMPORTED_MODULE_2__.distSquared2d)(pointX, pointY, fx + 0.5, fy + 0.5) < (0,_util_geometry__WEBPACK_IMPORTED_MODULE_2__.distSquared2d)(pointX, pointY, resX, resY)) {
                        resX = fx + 0.5;
                        resY = fy + 0.5;
                    }
                }
                break;
            case _game_grid__WEBPACK_IMPORTED_MODULE_4__.GridType.HEXAGON:
                {
                    // The algorithm here is quite complex and I couldn't find any of this online, so this is my own solution:
                    // (note: hexagon side = 1 because of the initial transformation).
                    // First we can notice that if we colour each point in a different colour depending on which vertex
                    // is closer to him (in a hexagonal grid) we find a grid of equilateral triangles of side 1.
                    // We then transform our grid by 2 / sqrt(3) on the horizontal side so that the height of the triangles
                    // will be the same as their base.
                    // With that done we can put a square grid on top of our triangle grid, each square will hold one
                    // triangle at its center and two halfes at the top and bottom.
                    // We can see which square the point belongs to by flooring the transformed x and y components, then
                    // we can check which triangle the points belongs to by chechinkg if the point is above or below
                    // the diagonal lines of equation: y < 0.5 - x/2 and y > x/2 + 0.5
                    // Note that each triangle column has half of a hexagon so the odd-ones will be flipped.
                    const s = 1 / SQRT3; // Hexagon Side = 1/sqrt(3)
                    let px = (pointX - s / 2) * 2 / SQRT3; // align the point with the triangle grid, and transform the grid
                    let py = pointY;
                    let sx = Math.floor(px);
                    let sy = Math.floor(py);
                    let gx = (px - sx);
                    let gy = (py - sy);
                    let rx = sx * SQRT3 / 2 + s / 2;
                    if (sx % 2 == 0) {
                        // Left side hexagon
                        if (gy < 0.5 - gx / 2) {
                            resY = sy;
                            resX = rx + s / 2;
                        }
                        else if (gy > gx / 2 + 0.5) {
                            resY = sy + 1;
                            resX = rx + s / 2;
                        }
                        else {
                            resY = sy + 0.5;
                            resX = rx + s;
                        }
                    }
                    else {
                        // Flipped hexagon: right side hex.
                        if (gy > 1 - gx / 2) {
                            resY = sy + 1;
                            resX = rx + s;
                        }
                        else if (gy < gx / 2) {
                            resY = sy;
                            resX = rx + s;
                        }
                        else {
                            resY = sy + 0.5;
                            resX = rx + s / 2;
                        }
                    }
                }
                break;
        }
        pnt.set((resX + this.gridRes.offX) * this.gridRes.size, (resY + this.gridRes.offY) * this.gridRes.size);
        this.sprite.worldTransform.applyInverse(pnt, pnt);
        return [pnt.x, pnt.y];
    }
    enable() {
        _index__WEBPACK_IMPORTED_MODULE_1__.app.renderer.on('resize', this.onResize, this);
        _index__WEBPACK_IMPORTED_MODULE_1__.app.stage.addChild(this.sprite);
        this.onResize(_index__WEBPACK_IMPORTED_MODULE_1__.app.screen.width, _index__WEBPACK_IMPORTED_MODULE_1__.app.screen.height);
    }
    destroy() {
        this.sprite.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_3__.DESTROY_ALL);
        _index__WEBPACK_IMPORTED_MODULE_1__.app.renderer.off('resize', this.onResize, this);
    }
}
// ----------------------------------------- DRAW -----------------------------------------
function drawGridTexture(size, type, options) {
    let canvas;
    switch (type) {
        case _game_grid__WEBPACK_IMPORTED_MODULE_4__.GridType.HEXAGON:
            canvas = drawHex(size, options);
            break;
        case _game_grid__WEBPACK_IMPORTED_MODULE_4__.GridType.SQUARE:
            canvas = drawSquare(size, options);
            break;
        default:
            throw 'Cannot draw unknown type: ' + type;
    }
    return _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.BaseTexture.fromBuffer(new Uint8Array(canvas.data.buffer), canvas.width, canvas.height);
}
function drawSquare(size, opt) {
    //let canvas = new OffscreenCanvas(size, size);
    let canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    let ctx = canvas.getContext("2d");
    ctx.lineWidth = opt.thick;
    ctx.strokeStyle = colorToHex(opt.color, opt.opacity);
    ctx.strokeRect(0, 0, size + 1, size + 1);
    return ctx.getImageData(0, 0, size, size);
}
function drawHex(size, opt) {
    let s = size / SQRT3; // Side
    let width = Math.floor(3 * s);
    //let canvas = new OffscreenCanvas(width, size);
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = size;
    let ctx = canvas.getContext("2d");
    let d = size;
    ctx.lineWidth = opt.thick;
    ctx.strokeStyle = colorToHex(opt.color, opt.opacity);
    ctx.moveTo(0, 0);
    ctx.lineTo(s, 0);
    ctx.lineTo(s + s / 2, d / 2);
    ctx.lineTo(2 * s + s / 2, d / 2);
    ctx.lineTo(3 * s, 0);
    ctx.moveTo(0, d);
    ctx.lineTo(s, d);
    ctx.lineTo(s + s / 2, d / 2);
    ctx.moveTo(2 * s + s / 2, d / 2);
    ctx.lineTo(3 * s, d);
    // Lines before the image:
    ctx.moveTo(0, 0);
    ctx.lineTo(-s / 2, d / 2);
    ctx.lineTo(0, d);
    ctx.stroke();
    return ctx.getImageData(0, 0, width, size);
}
function colorToHex(color, opacity) {
    return '#' + (color << 8 | (255 * opacity)).toString(16).padStart(8, '0');
}


/***/ }),

/***/ "./src/app/ecs/systems/interactionSystem.ts":
/*!**************************************************!*\
  !*** ./src/app/ecs/systems/interactionSystem.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ShapeType": () => (/* binding */ ShapeType),
/* harmony export */   "shapePoint": () => (/* binding */ shapePoint),
/* harmony export */   "shapeAabb": () => (/* binding */ shapeAabb),
/* harmony export */   "shapeCircle": () => (/* binding */ shapeCircle),
/* harmony export */   "shapeLine": () => (/* binding */ shapeLine),
/* harmony export */   "shapePolygon": () => (/* binding */ shapePolygon),
/* harmony export */   "shapeObb": () => (/* binding */ shapeObb),
/* harmony export */   "shapeIntersect": () => (/* binding */ shapeIntersect),
/* harmony export */   "shapeToAabb": () => (/* binding */ shapeToAabb),
/* harmony export */   "INTERACTION_TYPE": () => (/* binding */ INTERACTION_TYPE),
/* harmony export */   "InteractionSystem": () => (/* binding */ InteractionSystem)
/* harmony export */ });
/* harmony import */ var _geometry_collision__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../geometry/collision */ "./src/app/geometry/collision.ts");
/* harmony import */ var _geometry_aabb__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../geometry/aabb */ "./src/app/geometry/aabb.ts");
/* harmony import */ var _util_geometry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/geometry */ "./src/app/util/geometry.ts");
/* harmony import */ var _geometry_obb__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../geometry/obb */ "./src/app/geometry/obb.ts");
/* harmony import */ var _geometry_dynamicTree__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../geometry/dynamicTree */ "./src/app/geometry/dynamicTree.ts");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../storage */ "./src/app/ecs/storage.ts");
/* harmony import */ var _interaction__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../interaction */ "./src/app/ecs/interaction.ts");
/* harmony import */ var _game_pointDB__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../game/pointDB */ "./src/app/game/pointDB.ts");
/* harmony import */ var _gridSystem__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./gridSystem */ "./src/app/ecs/systems/gridSystem.ts");
/* harmony import */ var _selectionSystem__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./selectionSystem */ "./src/app/ecs/systems/selectionSystem.ts");
/* provided dependency */ var PIXI = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/pixi.es.js");










var ShapeType;
(function (ShapeType) {
    ShapeType[ShapeType["POINT"] = 0] = "POINT";
    ShapeType[ShapeType["AABB"] = 1] = "AABB";
    ShapeType[ShapeType["CIRCLE"] = 2] = "CIRCLE";
    ShapeType[ShapeType["LINE"] = 3] = "LINE";
    ShapeType[ShapeType["POLYGON"] = 4] = "POLYGON";
    ShapeType[ShapeType["OBB"] = 5] = "OBB";
})(ShapeType || (ShapeType = {}));
function shapePoint(pos) {
    return {
        type: ShapeType.POINT,
        pos,
    };
}
function shapeAabb(aabb) {
    return {
        type: ShapeType.AABB,
        data: aabb,
    };
}
function shapeCircle(center, radius) {
    return {
        type: ShapeType.CIRCLE,
        pos: center,
        radius: radius,
    };
}
function shapeLine(line) {
    return {
        type: ShapeType.LINE,
        data: line,
    };
}
function shapePolygon(polygon) {
    return {
        type: ShapeType.POLYGON,
        polygon,
    };
}
function shapeObb(obb) {
    return {
        type: ShapeType.OBB,
        data: obb,
    };
}
function shapeIntersect(shape1, shape2) {
    if (shape2.type < shape1.type)
        [shape2, shape1] = [shape1, shape2];
    let s1t = shape1.type;
    let s2t = shape2.type;
    // TODO: polygon vs polygon
    if (s1t === ShapeType.POINT) {
        let s1 = shape1;
        switch (s2t) {
            case ShapeType.POINT: return false;
            case ShapeType.AABB: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapAabbVsPoint)(shape2.data, s1.pos);
            case ShapeType.CIRCLE: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapPointVsCircle)(s1.pos, shape2.pos, shape2.radius);
            case ShapeType.LINE: return false;
            case ShapeType.POLYGON: return (0,_util_geometry__WEBPACK_IMPORTED_MODULE_2__.polygonPointIntersect)(s1.pos, shape2.polygon);
            case ShapeType.OBB: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapRotatedRectVsPoint)(shape2.data, s1.pos);
        }
    }
    else if (s1t === ShapeType.AABB) {
        let s1 = shape1;
        switch (s2t) {
            case ShapeType.AABB: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapAabbVsAabb)(shape2.data, s1.data);
            case ShapeType.CIRCLE: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapCircleVsAabb)(shape2.pos, shape2.radius, s1.data);
            case ShapeType.LINE: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapAabbVsLine)(s1.data, shape2.data);
            case ShapeType.POLYGON: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapObbVsPolygon)(_geometry_obb__WEBPACK_IMPORTED_MODULE_3__.Obb.fromAabb(s1.data), shape2.polygon);
            case ShapeType.OBB: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapRotatedRectVsAabb)(shape2.data, s1.data);
        }
    }
    else if (s1t === ShapeType.CIRCLE) {
        let s1 = shape1;
        switch (s2t) {
            case ShapeType.CIRCLE: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapCircleVsCircle)(shape2.pos, shape2.radius, s1.pos, s1.radius);
            case ShapeType.LINE: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapLineVsCircle)(shape2.data, s1.pos, s1.radius);
            case ShapeType.POLYGON: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapCircleVsPolygon)(s1.pos, s1.radius, shape2.polygon);
            case ShapeType.OBB: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapRotatedRectVsCircle)(shape2.data, s1.pos, s1.radius);
        }
    }
    else if (s1t === ShapeType.LINE) {
        let s1 = shape1;
        switch (s2t) {
            case ShapeType.LINE: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.intersectSegmentVsSegment)(s1.data, shape2.data) == _geometry_collision__WEBPACK_IMPORTED_MODULE_0__.SegmentVsSegmentRes.INTERN;
            case ShapeType.POLYGON: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapLineVsPolygon)(s1.data, shape2.polygon);
            case ShapeType.OBB: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapRotatedRectVsLine)(shape2.data, s1.data);
        }
    }
    else if (s1t === ShapeType.POLYGON) {
        let s1 = shape1;
        switch (s2t) {
            case ShapeType.POLYGON: break;
            case ShapeType.OBB: return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapObbVsPolygon)(shape2.data, s1.polygon);
        }
    }
    else if (s1t === ShapeType.OBB) {
        return (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_0__.overlapRotatedRectVsRotatedRect)(shape1.data, shape2.data);
    }
    // Polygon vs Polygon
    throw 'Query not implemented: ' + s1t + ' vs ' + s2t;
}
function shapeToAabb(shape) {
    switch (shape.type) {
        case ShapeType.POINT: return _geometry_aabb__WEBPACK_IMPORTED_MODULE_1__.Aabb.fromPoint(shape.pos);
        case ShapeType.AABB: return shape.data;
        case ShapeType.CIRCLE: {
            let s = shape;
            return new _geometry_aabb__WEBPACK_IMPORTED_MODULE_1__.Aabb(s.pos.x - s.radius, s.pos.y - s.radius, s.pos.x + s.radius, s.pos.y + s.radius);
        }
        case ShapeType.LINE: {
            let s = shape.data;
            return new _geometry_aabb__WEBPACK_IMPORTED_MODULE_1__.Aabb(s.fromX, s.fromY, s.toX, s.toY);
        }
        case ShapeType.POLYGON: {
            let aabb = _geometry_aabb__WEBPACK_IMPORTED_MODULE_1__.Aabb.zero();
            aabb.wrapPolygon(shape.polygon);
            return aabb;
        }
        case ShapeType.OBB: {
            let aabb = _geometry_aabb__WEBPACK_IMPORTED_MODULE_1__.Aabb.zero();
            aabb.wrapPolygon(shape.data.rotVertex);
            return aabb;
        }
        default: throw 'Unknown shape type: ' + shape.type;
    }
}
function shapeToSnaps(shape) {
    switch (shape.type) {
        case ShapeType.POINT:
        case ShapeType.CIRCLE: {
            let p = shape;
            return [p.pos.x, p.pos.y];
        }
        case ShapeType.AABB: {
            let aabb = shape.data;
            return [
                aabb.minX, aabb.minY,
                aabb.minX, aabb.maxY,
                aabb.maxX, aabb.minY,
                aabb.maxX, aabb.maxY,
            ];
        }
        case ShapeType.LINE: {
            let s = shape.data;
            return [
                s.fromX, s.fromY,
                s.toX, s.toY,
            ];
        }
        case ShapeType.POLYGON: {
            let pol = shape.polygon;
            let data = new Array();
            for (let i = 0; i < pol.length; i += 2) {
                data.push(pol[i], pol[i + 1]);
            }
            return data;
        }
        case ShapeType.OBB: {
            let pol = shape.data.rotVertex;
            let data = new Array(8);
            for (let i = 0; i < 8; i++) {
                data[i] = pol[i];
            }
            return data;
        }
        default: throw 'Unknown shape type: ' + shape.type;
    }
}
function shapeTranslate(shape, x, y) {
    switch (shape.type) {
        case ShapeType.CIRCLE:
        case ShapeType.POINT: {
            let s = shape;
            s.pos.x += x;
            s.pos.y += y;
            break;
        }
        case ShapeType.AABB: {
            let s = shape.data;
            s.translate(x, y, s);
            break;
        }
        case ShapeType.LINE: {
            let s = shape.data;
            s.fromX += x;
            s.fromY += y;
            s.toX += x;
            s.toY += y;
            break;
        }
        case ShapeType.POLYGON: {
            let s = shape;
            let slen = s.polygon.length;
            for (let i = 0; i < slen; i += 2) {
                s.polygon[i] += x;
                s.polygon[i + 1] += y;
            }
            break;
        }
        case ShapeType.OBB: {
            let s = shape.data;
            s.unrotated.translate(x, y, s.unrotated);
            let pol = s.rotVertex;
            for (let i = 0; i < 8; i += 2) {
                pol[i] += x;
                pol[i + 1] += y;
            }
            break;
        }
        default: throw 'Unknown shape type: ' + shape.type;
    }
}
function shapeClone(shape) {
    switch (shape.type) {
        case ShapeType.CIRCLE:
        case ShapeType.POINT: {
            let s = shape;
            return {
                type: ShapeType.POINT,
                pos: new PIXI.Point(s.pos.x, s.pos.y),
            };
        }
        case ShapeType.AABB: return shapeAabb(shape.data.copy());
        case ShapeType.LINE: return shapeLine(shape.data.copy());
        case ShapeType.POLYGON: return shapePolygon([...shape.polygon]);
        case ShapeType.OBB: return shapeObb(shape.data.copy());
        default: throw 'Unknown shape type: ' + shape.type;
    }
}
const INTERACTION_TYPE = 'interaction';
class InteractionSystem {
    constructor(world) {
        this.name = INTERACTION_TYPE;
        this.dependencies = [_gridSystem__WEBPACK_IMPORTED_MODULE_8__.GRID_TYPE, _selectionSystem__WEBPACK_IMPORTED_MODULE_9__.SELECTION_TYPE];
        this.storage = new _storage__WEBPACK_IMPORTED_MODULE_5__.SingleEcsStorage('interaction', false, false);
        this.isTranslating = false;
        this.aabbTree = new _geometry_dynamicTree__WEBPACK_IMPORTED_MODULE_4__.DynamicTree();
        this.world = world;
        this.selectionSys = this.world.systems.get(_selectionSystem__WEBPACK_IMPORTED_MODULE_9__.SELECTION_TYPE);
        this.snapDb = new _game_pointDB__WEBPACK_IMPORTED_MODULE_7__.PointDB(this.world.systems.get(_gridSystem__WEBPACK_IMPORTED_MODULE_8__.GRID_TYPE));
        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('tool_move_begin', this.onToolMoveBegin, this);
        world.events.on('tool_move_end', this.onToolMoveEnd, this);
        world.events.on('query_hit', this.onQueryHit, this);
    }
    registerSnapPoints(snaps) {
        let slen = snaps.length;
        for (let i = 0; i < slen; i += 2) {
            this.snapDb.insert([snaps[i], snaps[i + 1]]);
        }
    }
    unregisterSnapPoints(snaps) {
        let slen = snaps.length;
        for (let i = 0; i < slen; i += 2) {
            this.snapDb.remove([snaps[i], snaps[i + 1]]);
        }
    }
    unregisterComponent(comp) {
        if (comp._snaps) {
            this.unregisterSnapPoints(comp._snaps);
            comp._snaps = undefined;
        }
        if (comp._treeId !== undefined) {
            this.aabbTree.destroyProxy(comp._treeId);
            comp._treeId = undefined;
        }
    }
    updateComponent(comp) {
        this.unregisterComponent(comp);
        if (comp.shape === undefined)
            return;
        comp._treeId = this.aabbTree.createProxy(shapeToAabb(comp.shape), comp);
        if (comp.snapEnabled) {
            comp._snaps = shapeToSnaps(comp.shape);
            this.registerSnapPoints(comp._snaps);
        }
    }
    onComponentAdd(comp) {
        if (comp.type !== INTERACTION_TYPE)
            return;
        this.updateComponent(comp);
    }
    onComponentEdited(comp, changed) {
        if (comp.type === INTERACTION_TYPE) {
            let c = comp;
            if ('shape' in changed) {
                this.updateComponent(c);
            }
        }
        else if (comp.type === 'position') {
            let pos = comp;
            let inter = this.storage.getComponent(pos.entity);
            if (inter === undefined || inter.shape === undefined)
                return;
            let oldX = changed.x !== undefined ? changed.x : pos.x;
            let oldY = changed.y !== undefined ? changed.y : pos.y;
            let diffX = pos.x - oldX;
            let diffY = pos.y - oldY;
            if (diffX !== 0 || diffY !== 0) {
                // TODO: trigger component change(?)
                shapeTranslate(inter.shape, diffX, diffY);
                if (!(this.isTranslating && this.selectionSys.selectedEntities.has(pos.entity))) {
                    this.updateComponent(inter);
                }
            }
            return;
        }
        else if (comp.type === 'transform') {
            let trans = comp;
            let inter = this.storage.getComponent(trans.entity);
            if (inter === undefined || inter.shape === undefined)
                return;
            let shape = inter.shape;
            if (shape.type === ShapeType.POINT)
                return;
            if (shape.type === ShapeType.CIRCLE) {
                let s = shape;
                if ('scale' in changed) {
                    s.radius = s.radius * trans.scale / changed.scale;
                    this.updateComponent(inter);
                }
            }
            else if (shape.type === ShapeType.OBB) {
                let s = shape;
                if ('scale' in changed) {
                    let diffScale = trans.scale / changed.scale;
                    s.data.unrotated.scale(diffScale, diffScale, s.data.unrotated);
                }
                s.data.rotation = trans.rotation;
                s.data.recompute();
                this.updateComponent(inter);
            }
            else {
                console.warn("Unable to auto-rotate other shapes than OBB, watch your components!");
                return;
            }
        }
    }
    onComponentRemove(comp) {
        if (comp.type !== INTERACTION_TYPE)
            return;
        this.unregisterComponent(comp);
    }
    onToolMoveBegin() {
        for (let comp of this.selectionSys.getSelectedByType(INTERACTION_TYPE)) {
            let c = comp;
            this.unregisterComponent(c);
        }
        this.isTranslating = true;
    }
    onToolMoveEnd() {
        this.isTranslating = false;
        for (let comp of this.selectionSys.getSelectedByType(INTERACTION_TYPE)) {
            let c = comp;
            this.updateComponent(c);
        }
    }
    singleHitQuery(shape, event) {
        let bestPrior = Number.NEGATIVE_INFINITY;
        let best = -1;
        let iter = this.queryVisible(shape, (c) => (c.selectPriority || 0) > bestPrior);
        for (let item of iter) {
            best = item.entity;
            bestPrior = item.selectPriority || 0;
        }
        if (best !== -1) {
            event.addHit(best);
        }
    }
    multiHitQuery(shape, event) {
        let iter = this.queryVisible(shape, (c) => c.selectPriority !== undefined);
        for (let item of iter) {
            event.addHit(item.entity);
            if (!event.shouldContinue())
                return;
        }
    }
    onQueryHit(event) {
        if (!event.shouldContinue())
            return;
        let shape;
        switch (event.type) {
            case _interaction__WEBPACK_IMPORTED_MODULE_6__.GeomertyQueryType.POINT:
                shape = shapeCircle(event.data, 20);
                break;
            //case GeomertyQueryType.POINT: shape = shapePoint(event.data as PIXI.IPointData); break; // ENABLE THIS FOR POINT-PRECISION CLICKING
            case _interaction__WEBPACK_IMPORTED_MODULE_6__.GeomertyQueryType.AABB:
                shape = shapeAabb(event.data);
                break;
            default: throw 'Unknown query type';
        }
        if (event.multi) {
            this.multiHitQuery(shape, event);
        }
        else {
            this.singleHitQuery(shape, event);
        }
    }
    queryVisible(shape, preCheck) {
        let playerVis = undefined;
        if (!this.world.isMaster) {
            playerVis = this.world.storages.get('player_visible');
        }
        if (playerVis === undefined)
            return this.query(shape, preCheck);
        return this.query(shape, c => {
            let visC = playerVis.getComponent(c.entity);
            if (visC !== undefined && !visC.visible)
                return false;
            return preCheck === undefined ? true : preCheck(c);
        });
    }
    *query(shape, preCheck) {
        let aabb = shapeToAabb(shape);
        for (let c of this.aabbTree.query(aabb)) {
            let tag = c.tag;
            if (preCheck && !preCheck(tag))
                continue;
            if (!shapeIntersect(tag.shape, shape))
                continue;
            let qc = tag.queryCheck;
            if (qc && !qc(shape))
                continue;
            yield tag;
        }
    }
    enable() {
    }
    destroy() {
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/lightSystem.ts":
/*!********************************************!*\
  !*** ./src/app/ecs/systems/lightSystem.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEFAULT_BACKGROUND": () => (/* binding */ DEFAULT_BACKGROUND),
/* harmony export */   "DEFAULT_LIGHT_SETTINGS": () => (/* binding */ DEFAULT_LIGHT_SETTINGS),
/* harmony export */   "LIGHT_TYPE": () => (/* binding */ LIGHT_TYPE),
/* harmony export */   "LIGHT_SETTINGS_TYPE": () => (/* binding */ LIGHT_SETTINGS_TYPE),
/* harmony export */   "LOCAL_LIGHT_SETTINGS_TYPE": () => (/* binding */ LOCAL_LIGHT_SETTINGS_TYPE),
/* harmony export */   "LightSystem": () => (/* binding */ LightSystem)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./src/app/ecs/component.ts");
/* harmony import */ var _util_pixi__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/pixi */ "./src/app/util/pixi.ts");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../storage */ "./src/app/ecs/storage.ts");
/* harmony import */ var _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../phase/editMap/displayPrecedence */ "./src/app/phase/editMap/displayPrecedence.ts");
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../index */ "./src/app/index.ts");
/* harmony import */ var _visibilitySystem__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./visibilitySystem */ "./src/app/ecs/systems/visibilitySystem.ts");
/* harmony import */ var _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../game/pointLightRenderer */ "./src/app/game/pointLightRenderer.ts");
/* harmony import */ var _playerSystem__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./playerSystem */ "./src/app/ecs/systems/playerSystem.ts");
/* harmony import */ var _pixiBoardSystem__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./pixiBoardSystem */ "./src/app/ecs/systems/pixiBoardSystem.ts");
/* harmony import */ var _toolSystem__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./toolSystem */ "./src/app/ecs/systems/toolSystem.ts");
/* harmony import */ var _tools_utils__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../tools/utils */ "./src/app/ecs/tools/utils.ts");
/* harmony import */ var _tools_toolType__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../tools/toolType */ "./src/app/ecs/tools/toolType.ts");
/* harmony import */ var _gridSystem__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./gridSystem */ "./src/app/ecs/systems/gridSystem.ts");
/* harmony import */ var _game_grid__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../game/grid */ "./src/app/game/grid.ts");










var hex2rgb = _PIXI__WEBPACK_IMPORTED_MODULE_4__.default.utils.hex2rgb;





const DEFAULT_BACKGROUND = 0x6e472c;
const DEFAULT_LIGHT_SETTINGS = {
    ambientLight: 0x555555,
    background: DEFAULT_BACKGROUND,
    needsLight: true,
};
const LIGHT_TYPE = 'light';
const LIGHT_SETTINGS_TYPE = 'light_settings';
const LOCAL_LIGHT_SETTINGS_TYPE = 'local_light_settings';
/**
 * How is light rendered?
 * There are three logical passes on a separate framebuffer.
 * Then this framebuffer is pasted onto the real screen.
 * 1. Clear the RGBA channels with the ambient light.
 * 2. Draw only in the ALPHA channel every player mesh (achieved by setting the color to 0)
 * 3. Draw the light only where the ALPHA channel is 1 (using a custom blend mode)
 * 4. Draw the framebuffer on the screen ignoring the ALPHA channel (using a custom blend mode)
 *
 * Why is this usage of the alpha channel used?
 * We need to render light only where visible, so in the RP-view the players vision polygons should be used as a
 * mask for the light (you can't see a light that no player sees). So when the RP-view is enabled the framebuffer is
 * cleared with alpha=0 and the player's vision will fill in the alpha (they should be rendered BEFORE the lights).
 * When the DM-view is enabled the framebuffer is rendered with alpha=1 and the player's view is not drawn.
 *
 * Why isn't the visibility polygon rendering batched?
 * We need uniforms in the shaders to know the distance from the light center: remember that visibility mesh is not only
 * the visibility polygon, it also calculates the distance form the center of the light (to render a proper circle).
 * So yeah, no batched uniforms in WebGL it seems. (TODO: explore more possibilities)
 */
class LightSystem {
    constructor(world) {
        var _a;
        this.name = LIGHT_TYPE;
        this.dependencies = [_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_9__.PIXI_BOARD_TYPE, _playerSystem__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPE];
        this.storage = new _storage__WEBPACK_IMPORTED_MODULE_2__.SingleEcsStorage(LIGHT_TYPE);
        this.world = world;
        this.lightLayer = new _PIXI__WEBPACK_IMPORTED_MODULE_4__.default.display.Layer();
        this.playerContainer = new _PIXI__WEBPACK_IMPORTED_MODULE_4__.default.Container();
        this.lightContainer = new _PIXI__WEBPACK_IMPORTED_MODULE_4__.default.Container();
        let toolSys = world.systems.get(_toolSystem__WEBPACK_IMPORTED_MODULE_10__.TOOL_TYPE);
        toolSys.addTool((0,_tools_utils__WEBPACK_IMPORTED_MODULE_11__.createEmptyDriver)(_tools_toolType__WEBPACK_IMPORTED_MODULE_12__.Tool.LIGHT));
        world.addStorage(this.storage);
        this.lightSettings = Object.assign({
            type: LIGHT_SETTINGS_TYPE,
            _save: true, _sync: true,
        }, DEFAULT_LIGHT_SETTINGS);
        world.addResource(this.lightSettings);
        this.localLightSettings = {
            type: LOCAL_LIGHT_SETTINGS_TYPE,
            visionType: this.world.isMaster ? 'dm' : 'rp',
            _save: true, _sync: false,
        };
        world.addResource(this.localLightSettings);
        this.gridSize = ((_a = this.world.getResource(_gridSystem__WEBPACK_IMPORTED_MODULE_13__.GRID_TYPE)) !== null && _a !== void 0 ? _a : _game_grid__WEBPACK_IMPORTED_MODULE_14__.STANDARD_GRID_OPTIONS).size;
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
    }
    createLightVisMesh() {
        let mesh = _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_7__.createMesh();
        mesh.blendMode = _util_pixi__WEBPACK_IMPORTED_MODULE_1__.CUSTOM_BLEND_MODES.ADD_WHERE_ALPHA_1;
        this.lightContainer.addChild(mesh);
        return mesh;
    }
    createPlayerVisMesh() {
        let mesh = _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_7__.createMesh('player');
        mesh.blendMode = _PIXI__WEBPACK_IMPORTED_MODULE_4__.default.BLEND_MODES.ADD;
        this.playerContainer.addChild(mesh);
        return mesh;
    }
    updateVisMesh(mesh, pos, poly) {
        mesh.visible = true;
        _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_7__.updateMeshPolygons(mesh, pos, poly);
    }
    updateVisUniforms(mesh, center, rangeSquared, color) {
        _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_7__.updateMeshUniforms(mesh, center, rangeSquared, color);
    }
    disableVisMesh(mesh) {
        mesh.visible = false;
    }
    updateVisPolygon(entity, target, color, pos, vis) {
        if (pos === undefined) {
            pos = this.world.getComponent(entity, _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
            if (pos === undefined)
                return;
        }
        if (vis === undefined) {
            vis = this.world.getComponent(entity, _visibilitySystem__WEBPACK_IMPORTED_MODULE_6__.VISIBILITY_TYPE);
            if (vis === undefined) {
                this.disableVisMesh(target);
                return;
            }
        }
        if (vis.polygon === undefined) {
            this.disableVisMesh(target);
        }
        else {
            let range = vis.range * this.gridSize;
            this.updateVisMesh(target, pos, vis.polygon);
            this.updateVisUniforms(target, pos, range * range, color);
        }
    }
    updateLightVisPolygon(light, pos, vis) {
        this.updateVisPolygon(light.entity, light._lightDisplay, light.color, pos, vis);
    }
    updatePlayerVisPolygon(player, pos, vis) {
        if (player._lightVisionDisplay === undefined) {
            player._lightVisionDisplay = this.createPlayerVisMesh();
        }
        this.updateVisPolygon(player.entity, player._lightVisionDisplay, 0, pos, vis);
    }
    onComponentAdd(comp) {
        if (comp.type === LIGHT_TYPE) {
            let light = comp;
            light._lightDisplay = this.createLightVisMesh();
            let vis = {
                type: _visibilitySystem__WEBPACK_IMPORTED_MODULE_6__.VISIBILITY_TYPE,
                range: light.range,
                trackWalls: true,
            };
            this.world.addComponent(comp.entity, vis);
            this.updateLightVisPolygon(light, undefined, vis);
        }
        else if (comp.type === _playerSystem__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPE) {
            let player = comp;
            if (player._lightVisionDisplay === undefined) {
                player._lightVisionDisplay = this.createPlayerVisMesh();
            }
            let vis = this.world.getComponent(player.entity, _visibilitySystem__WEBPACK_IMPORTED_MODULE_6__.VISIBILITY_TYPE);
            if (vis === undefined) {
                console.error("Player does not have a visibility type");
            }
            this.updatePlayerVisPolygon(player, undefined, vis);
        }
    }
    onComponentEdited(comp, changes) {
        if (comp.type === LIGHT_TYPE) {
            let c = comp;
            if ('range' in changes) {
                this.world.editComponent(c.entity, _visibilitySystem__WEBPACK_IMPORTED_MODULE_6__.VISIBILITY_TYPE, {
                    range: c.range
                });
            }
            else {
                let pos = this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
                let vis = this.world.getComponent(c.entity, _visibilitySystem__WEBPACK_IMPORTED_MODULE_6__.VISIBILITY_TYPE);
                if (vis.polygon !== undefined) {
                    let range = vis.range * this.gridSize;
                    this.updateVisUniforms(c._lightDisplay, pos, range * range, c.color);
                }
            }
        }
        else if (comp.type === _visibilitySystem__WEBPACK_IMPORTED_MODULE_6__.VISIBILITY_TYPE) {
            let vis = comp;
            if (!('polygon' in changes))
                return;
            let light = this.storage.getComponent(vis.entity);
            if (light !== undefined) {
                this.updateLightVisPolygon(light, undefined, vis);
            }
            else {
                let player = this.world.getComponent(vis.entity, _playerSystem__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPE);
                if (player !== undefined) {
                    this.updatePlayerVisPolygon(player, undefined, vis);
                }
            }
        }
    }
    onResourceEdited(comp, changed) {
        if (comp.type === _gridSystem__WEBPACK_IMPORTED_MODULE_13__.GRID_TYPE) {
            if (!('size' in changed))
                return;
            let grid = comp;
            this.gridSize = grid.size;
            // We don't really care, the visibility polygons will change on their own
        }
        else if (comp.type === LIGHT_SETTINGS_TYPE || comp.type === LOCAL_LIGHT_SETTINGS_TYPE) {
            let arr = [0.0, 0.0, 0.0, 0.0];
            if (this.localLightSettings.visionType === 'dm')
                arr[3] = 1.0;
            hex2rgb(this.lightSettings.ambientLight, arr);
            this.lightLayer.clearColor = arr;
            this.playerContainer.visible = this.localLightSettings.visionType !== 'dm';
            _index__WEBPACK_IMPORTED_MODULE_5__.app.renderer.backgroundColor = this.lightSettings.background;
        }
    }
    onComponentRemove(comp) {
        var _a, _b;
        if (comp.type === LIGHT_TYPE) {
            let light = comp;
            (_a = light._lightDisplay) === null || _a === void 0 ? void 0 : _a.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_1__.DESTROY_ALL);
            let vis = this.world.getComponent(comp.entity, _visibilitySystem__WEBPACK_IMPORTED_MODULE_6__.VISIBILITY_TYPE);
            if (vis !== undefined) {
                this.world.removeComponent(vis);
            }
            else {
                console.warn("No light visibility found on removal");
            }
        }
        else if (comp.type === _playerSystem__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPE) {
            let player = comp;
            (_b = player._lightVisionDisplay) === null || _b === void 0 ? void 0 : _b.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_1__.DESTROY_ALL);
        }
    }
    enable() {
        _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_7__.setup();
        this.lightLayer.useRenderTexture = true;
        this.lightLayer.interactive = false;
        this.lightLayer.interactiveChildren = false;
        this.playerContainer.zOrder = _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_3__.DisplayPrecedence.LIGHT - 1;
        this.playerContainer.zIndex = _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_3__.DisplayPrecedence.LIGHT - 1;
        this.playerContainer.interactive = false;
        this.playerContainer.interactiveChildren = false;
        let lightSystem = this.world.systems.get(LIGHT_TYPE);
        this.playerContainer.parentLayer = lightSystem.lightLayer;
        this.lightContainer.zOrder = _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_3__.DisplayPrecedence.LIGHT;
        this.lightContainer.zIndex = _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_3__.DisplayPrecedence.LIGHT;
        this.lightContainer.interactive = false;
        this.lightContainer.interactiveChildren = false;
        this.lightContainer.parentLayer = this.lightLayer;
        this.onResourceEdited(this.lightSettings, {}); // Update the clearColor
        let lightingSprite = new _PIXI__WEBPACK_IMPORTED_MODULE_4__.default.Sprite(this.lightLayer.getRenderTexture());
        lightingSprite.blendMode = _util_pixi__WEBPACK_IMPORTED_MODULE_1__.CUSTOM_BLEND_MODES.MULTIPLY_COLOR_ONLY;
        lightingSprite.zIndex = _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_3__.DisplayPrecedence.LIGHT;
        lightingSprite.interactive = false;
        lightingSprite.interactiveChildren = false;
        let board = this.world.systems.get(_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_9__.PIXI_BOARD_TYPE);
        board.board.addChild(this.playerContainer, this.lightContainer, this.lightLayer);
        _index__WEBPACK_IMPORTED_MODULE_5__.app.stage.addChild(lightingSprite);
    }
    destroy() {
        this.lightContainer.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_1__.DESTROY_ALL);
        this.playerContainer.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_1__.DESTROY_ALL);
        this.lightLayer.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_1__.DESTROY_ALL);
        _index__WEBPACK_IMPORTED_MODULE_5__.app.renderer.backgroundColor = DEFAULT_BACKGROUND;
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/networkSystem.ts":
/*!**********************************************!*\
  !*** ./src/app/ecs/systems/networkSystem.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NETWORK_TYPE": () => (/* binding */ NETWORK_TYPE),
/* harmony export */   "HOST_NETWORK_TYPE": () => (/* binding */ HOST_NETWORK_TYPE),
/* harmony export */   "HostNetworkSystem": () => (/* binding */ HostNetworkSystem),
/* harmony export */   "CLIENT_NETWORK_TYPE": () => (/* binding */ CLIENT_NETWORK_TYPE),
/* harmony export */   "ClientNetworkSystem": () => (/* binding */ ClientNetworkSystem)
/* harmony export */ });
const NETWORK_TYPE = 'network';
const HOST_NETWORK_TYPE = 'host_network';
class HostNetworkSystem {
    constructor(world, ch) {
        this.name = HOST_NETWORK_TYPE;
        this.dependencies = [];
        this.provides = [NETWORK_TYPE];
        this.connectedClients = 0;
        this.isEnabled = false;
        this.world = world;
        this.channel = ch;
        this.channel.eventEmitter.on('_device_join', this.onDeviceJoin, this);
        this.channel.eventEmitter.on('_device_left', this.onDeviceLeft, this);
        this.channel.eventEmitter.on('cmd', this.onCommandPacket, this);
        this.world.events.on('command_share', this.onCommandShare, this);
    }
    // ---------------------------------- EVENT LISTENERS ----------------------------------
    onDeviceJoin(chId) {
        this.connectedClients++;
        this.isEnabled = true;
        this.channel.send({
            type: "ecs_bootstrap",
            payload: this.world.serializeClient(),
        }, chId);
    }
    onDeviceLeft(chId) {
        this.connectedClients--;
        this.isEnabled = this.connectedClients !== 0;
    }
    onCommandPacket(pkt, container) {
        const sender = container.sender;
        for (let cmd of pkt.data) {
            if (!this.checkCommand(sender, cmd))
                continue;
            this.world.events.emit("command_emit", cmd, false);
        }
    }
    checkCommand(sender, command) {
        console.warn("Received command from non-admin: ", command);
        return false;
    }
    onCommandShare(command) {
        if (command.length === 0)
            return;
        this.channel.broadcast({
            type: 'cmd',
            data: command,
        });
    }
    isOnline() {
        return this.channel.connections.length !== 0;
    }
    enable() {
    }
    destroy() {
    }
}
const CLIENT_NETWORK_TYPE = 'client_network';
class ClientNetworkSystem {
    constructor(ecs, channel) {
        this.name = CLIENT_NETWORK_TYPE;
        this.dependencies = [];
        this.provides = [NETWORK_TYPE];
        this.world = ecs;
        this.channel = channel;
        channel.eventEmitter.on('ecs_bootstrap', this.onEcsBootstrap, this);
        channel.eventEmitter.on('cmd', this.onCmd, this);
    }
    onEcsBootstrap(packet, container) {
        if (container.sender !== 0)
            return; // Only admin
        this.world.deserialize(packet.payload);
    }
    onCmd(packet, container) {
        for (let cmd of packet.data) {
            if (!this.checkCommand(container.sender, cmd))
                continue;
            this.world.events.emit("command_emit", cmd);
        }
    }
    checkCommand(sender, command) {
        if (sender === 0)
            return true;
        console.warn("Received command from non-admin: ", command);
        return false;
    }
    isOnline() {
        return this.channel.connections.length !== 0;
    }
    enable() {
    }
    destroy() {
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/pinSystem.ts":
/*!******************************************!*\
  !*** ./src/app/ecs/systems/pinSystem.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PIN_TYPE": () => (/* binding */ PIN_TYPE),
/* harmony export */   "PinSystem": () => (/* binding */ PinSystem),
/* harmony export */   "CreatePinToolDriver": () => (/* binding */ CreatePinToolDriver)
/* harmony export */ });
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../storage */ "./src/app/ecs/storage.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./src/app/ecs/component.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../graphics */ "./src/app/graphics.ts");
/* harmony import */ var _pixiGraphicSystem__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pixiGraphicSystem */ "./src/app/ecs/systems/pixiGraphicSystem.ts");
/* harmony import */ var _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../phase/editMap/displayPrecedence */ "./src/app/phase/editMap/displayPrecedence.ts");
/* harmony import */ var _toolSystem__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./toolSystem */ "./src/app/ecs/systems/toolSystem.ts");
/* harmony import */ var _selectionSystem__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./selectionSystem */ "./src/app/ecs/systems/selectionSystem.ts");
/* harmony import */ var _tools_toolType__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../tools/toolType */ "./src/app/ecs/tools/toolType.ts");
/* harmony import */ var _command_command__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./command/command */ "./src/app/ecs/systems/command/command.ts");









const PIN_TYPE = 'pin';
class PinSystem {
    constructor(world) {
        this.name = PIN_TYPE;
        this.dependencies = [_toolSystem__WEBPACK_IMPORTED_MODULE_5__.TOOL_TYPE, _graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE, _selectionSystem__WEBPACK_IMPORTED_MODULE_6__.SELECTION_TYPE];
        this.storage = new _storage__WEBPACK_IMPORTED_MODULE_0__.SingleEcsStorage(PIN_TYPE, true, true);
        this.world = world;
        this.selectionSys = this.world.systems.get(_selectionSystem__WEBPACK_IMPORTED_MODULE_6__.SELECTION_TYPE);
        if (world.isMaster) {
            let toolSys = world.systems.get(_toolSystem__WEBPACK_IMPORTED_MODULE_5__.TOOL_TYPE);
            toolSys.addTool(new CreatePinToolDriver(this));
        }
        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
    }
    onComponentAdd(c) {
        if (c.type !== PIN_TYPE)
            return;
        let pin = c;
        let pos = this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_1__.POSITION_TYPE);
        if (pos === undefined)
            return;
        let display = this.world.getComponent(c.entity, _graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE);
        if (display === undefined) {
            display = {
                type: _graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE,
                entity: -1,
                interactive: true,
                display: this.createElement()
            };
            this.world.addComponent(c.entity, display);
        }
        this.redrawComponent(pin, display.display);
    }
    onComponentEdited(comp, changed) {
        if (comp.type === PIN_TYPE) {
            let pin = comp;
            let grapc = this.world.getComponent(comp.entity, _graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE);
            let pinDisplay = grapc.display;
            this.redrawComponent(pin, pinDisplay);
        }
    }
    createElement() {
        return {
            type: _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.POINT,
            priority: _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_4__.DisplayPrecedence.PINS,
            visib: _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.NORMAL,
            ignore: false,
            interactive: true,
            color: 0xFFFFFF,
            children: [],
        };
    }
    redrawComponent(pin, display) {
        display.color = pin.color;
        if (pin.label !== undefined) {
            if (display.children.length === 0) {
                display._childrenAdd = [{
                        type: _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.TEXT,
                        ignore: false,
                        interactive: false,
                        priority: 0,
                        visib: _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.NORMAL,
                        anchor: { x: 0.5, y: 1.0 },
                        offset: { x: 0, y: -_pixiGraphicSystem__WEBPACK_IMPORTED_MODULE_3__.POINT_RADIUS },
                        color: 0,
                        text: pin.label,
                    }];
            }
            else {
                display.children[0].text = pin.label;
            }
        }
        else {
            display._childrenReplace = [];
        }
        this.world.editComponent(pin.entity, _graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE, { display }, undefined, false);
    }
    enable() {
    }
    destroy() {
    }
}
class CreatePinToolDriver {
    constructor(sys) {
        this.name = _tools_toolType__WEBPACK_IMPORTED_MODULE_7__.Tool.CREATE_PIN;
        // Entity of the pin to be created (or -1)
        this.createPin = -1;
        this.sys = sys;
    }
    initCreation() {
        this.cancelCreation();
        let color = Math.floor(Math.random() * 0xFFFFFF);
        let display = this.sys.createElement();
        display.color = color;
        display.visib = _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.ALWAYS_VISIBLE;
        this.createPin = this.sys.world.spawnEntity({
            type: _component__WEBPACK_IMPORTED_MODULE_1__.HOST_HIDDEN_TYPE,
        }, {
            type: _component__WEBPACK_IMPORTED_MODULE_1__.POSITION_TYPE,
            entity: -1,
            x: Number.NEGATIVE_INFINITY,
            y: Number.NEGATIVE_INFINITY,
        }, {
            type: _graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE,
            entity: -1,
            interactive: false,
            display,
        }, {
            type: _component__WEBPACK_IMPORTED_MODULE_1__.FOLLOW_MOUSE_TYPE,
        });
    }
    cancelCreation() {
        if (this.createPin !== -1) {
            this.sys.world.despawnEntity(this.createPin);
            this.createPin = -1;
        }
    }
    confirmCreation() {
        if (this.createPin === -1)
            return;
        const world = this.sys.world;
        let id = this.createPin;
        let g = world.getComponent(id, _graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE);
        let loc = world.getComponent(id, _component__WEBPACK_IMPORTED_MODULE_1__.POSITION_TYPE);
        world.despawnEntity(id);
        let cmd = {
            kind: 'spawn',
            entities: [{
                    id: world.allocateId(),
                    components: [
                        {
                            type: 'position',
                            x: loc.x,
                            y: loc.y,
                        },
                        {
                            type: PIN_TYPE,
                            color: g.display.color,
                        },
                    ]
                }]
        };
        this.createPin = -1;
        this.sys.world.editResource(_toolSystem__WEBPACK_IMPORTED_MODULE_5__.TOOL_TYPE, {
            tool: _tools_toolType__WEBPACK_IMPORTED_MODULE_7__.Tool.INSPECT,
        });
        (0,_command_command__WEBPACK_IMPORTED_MODULE_8__.executeAndLogCommand)(world, cmd);
        //this.sys.selectionSys.setOnlyEntity(id);
    }
    onStart() {
        this.initCreation();
    }
    onEnd() {
        this.cancelCreation();
    }
    onPointerClick(event) {
        this.confirmCreation();
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/pixiBoardSystem.ts":
/*!************************************************!*\
  !*** ./src/app/ecs/systems/pixiBoardSystem.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PointerEvents": () => (/* binding */ PointerEvents),
/* harmony export */   "BOARD_TRANSFORM_TYPE": () => (/* binding */ BOARD_TRANSFORM_TYPE),
/* harmony export */   "PIXI_BOARD_TYPE": () => (/* binding */ PIXI_BOARD_TYPE),
/* harmony export */   "PixiBoardSystem": () => (/* binding */ PixiBoardSystem)
/* harmony export */ });
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../index */ "./src/app/index.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../component */ "./src/app/ecs/component.ts");
/* harmony import */ var _tools_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../tools/utils */ "./src/app/ecs/tools/utils.ts");




var PointerEvents;
(function (PointerEvents) {
    PointerEvents["POINTER_MOVE"] = "pointer_move";
    PointerEvents["POINTER_DOWN"] = "pointer_down";
    PointerEvents["POINTER_UP"] = "pointer_up";
    PointerEvents["POINTER_RIGHT_DOWN"] = "pointer_right_down";
    PointerEvents["POINTER_RIGHT_UP"] = "pointer_right_up";
    PointerEvents["POINTER_CLICK"] = "pointer_click";
})(PointerEvents || (PointerEvents = {}));
const BOARD_TRANSFORM_TYPE = 'board_transform';
const PIXI_BOARD_TYPE = 'pixi_board';
class PixiBoardSystem {
    constructor(world) {
        this.name = PIXI_BOARD_TYPE;
        this.dependencies = [];
        this.pointers = new Map();
        this.mouseLastX = 0;
        this.mouseLastY = 0;
        this.isDraggingBoard = false;
        this.world = world;
        this.world.events.on('req_board_center', this.centerBoard, this);
        this.world.events.on('resource_edited', this.onResourceEdited, this);
        this.world.addResource({
            type: BOARD_TRANSFORM_TYPE,
            _save: true,
            _sync: false,
            posX: 0,
            posY: 0,
            scaleX: 1,
            scaleY: 1,
        });
        // TODO: we should create render phases, one for the world (using the projection matrix to move the camera)
        //       and the other for the GUI (or other things that do not depend on camera position, as the GridSystem(?)).
        //       to create a custom game loop: https://github.com/pixijs/pixi.js/wiki/v5-Custom-Application-GameLoop
        this.board = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Container();
        this.board.interactive = false;
        this.board.interactiveChildren = false;
        this.board.position.set(0, 0);
        this.board.sortableChildren = true;
    }
    canBecomeClick(pdata, p) {
        let now = Date.now();
        let timeDiff = now - (this.lastMouseDownTime || 0);
        let diffX = p.x - pdata.firstX;
        let diffY = p.y - pdata.firstY;
        let diffPos = Math.sqrt(diffX * diffX + diffY * diffY);
        return diffPos < 5 && timeDiff < 500;
    }
    zoom(dScale, centerX, centerY) {
        const minScale = 0.05;
        const maxScale = 3;
        if (this.board.scale.x < minScale && dScale < 1 || this.board.scale.x > maxScale && dScale > 1)
            return;
        // Before scaling adjust the position:
        // Takes the vector that goes from the board position (upper-left) to the cursor.
        // Apply the dScale factor to that vector and find the new board position.
        // Finally, the cursor position plus the vector obtained is the new board position.
        let padX = this.board.position.x - centerX;
        let padY = this.board.position.y - centerY;
        padX *= dScale;
        padY *= dScale;
        const position = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Point(padX + centerX, padY + centerY);
        const scale = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Point(this.board.scale.x * dScale, this.board.scale.y * dScale);
        // TODO
        /*if (this.board.isBoardLost(position, scale)) {
            console.log("You can't no more scale in this direction, you're loosing the board!");
            return;
        }*/
        this.world.editResource(BOARD_TRANSFORM_TYPE, {
            posX: position.x,
            posY: position.y,
            scaleX: scale.x,
            scaleY: scale.y,
        });
    }
    /**
     * Function called when the mouse scrolls.
     * The map is zoomed in and out based on the scroll direction.
     */
    onMouseWheel(event) {
        const scalingSpeed = 0.1;
        const dScale = 1 - Math.sign(event.deltaY) * scalingSpeed;
        this.zoom(dScale, event.clientX, event.clientY);
    }
    onPointerDown(event) {
        if (event.data.pointerType === 'mouse' && event.data.button === 2) {
            // Right button
            let prde = event;
            prde.consumed = false;
            this.world.events.emit(PointerEvents.POINTER_RIGHT_DOWN, prde);
            return;
        }
        let pos = event.data.global;
        this.pointers.set(event.data.pointerId, {
            firstX: pos.x,
            firstY: pos.y,
            lastX: pos.x,
            lastY: pos.y,
        });
        this.lastMouseDownTime = Date.now();
        let e = event;
        e.consumed = false;
        if (!(event.data.pointerType === 'mouse' && event.data.button === 1)) {
            // If middle button is pressed ignore, we force it to drag the board
            this.world.events.emit(PointerEvents.POINTER_DOWN, event);
        }
        if (!e.consumed && this.pointers.size === 1) {
            this.isDraggingBoard = true;
        }
    }
    onPointerUp(event) {
        if (event.data.pointerType === 'mouse' && event.data.button === 2) {
            // Right button
            this.world.events.emit(PointerEvents.POINTER_RIGHT_UP, event);
        }
        let pdata = this.pointers.get(event.data.pointerId);
        if (pdata === undefined)
            return;
        this.pointers.delete(event.data.pointerId);
        if (this.lastMouseDownTime === undefined)
            return;
        if (this.pointers.size === 0) {
            this.isDraggingBoard = false;
            let isClick = this.canBecomeClick(pdata, event.data.global);
            let pue = event;
            pue.lastPosition = {
                x: pdata.lastX,
                y: pdata.lastY
            };
            pue.isClick = isClick;
            this.world.events.emit(PointerEvents.POINTER_UP, pue);
            if (isClick) {
                this.world.events.emit(PointerEvents.POINTER_CLICK, event);
            }
        }
    }
    onPointerUpOutside(event) {
        this.onPointerUp(event);
    }
    /** Function called when the cursor moves around the map. */
    onPointerMove(e) {
        let pos = e.data.global;
        // TODO: magnet snap system
        let localPos = (0,_tools_utils__WEBPACK_IMPORTED_MODULE_3__.getMapPointFromMouseInteraction)(this.world, e);
        this.updatePointerFollowers(localPos);
        let pdata = this.pointers.get(e.data.pointerId);
        if (this.pointers.size <= 1 && !this.isDraggingBoard) {
            let pme = e;
            pme.lastPosition = {
                x: this.mouseLastX, y: this.mouseLastY,
            };
            pme.canBecomeClick = pdata === undefined ? false : this.canBecomeClick(pdata, pos);
            this.world.events.emit(PointerEvents.POINTER_MOVE, pme);
            this.mouseLastX = pos.x;
            this.mouseLastY = pos.y;
        }
        if (pdata === undefined)
            return;
        if (this.pointers.size === 1) { // Move
            if (this.isDraggingBoard) {
                const newPosX = this.board.position.x + (pos.x - pdata.lastX);
                const newPosY = this.board.position.y + (pos.y - pdata.lastY);
                /*if (this.board.isBoardLost(new PIXI.Point(newPosX, newPosY), this.scale)) {
                    //console.log("You can't go further than this, you'll loose the board!");
                    return;
                }*/
                this.world.editResource(BOARD_TRANSFORM_TYPE, {
                    posX: newPosX,
                    posY: newPosY,
                });
            }
        }
        let firstDist = 0;
        if (this.pointers.size === 2) {
            let [pa, pb] = this.pointers.values();
            let dx = pa.lastX - pb.lastX;
            let dy = pa.lastY - pb.lastY;
            firstDist = Math.sqrt(dx * dx + dy * dy);
        }
        pdata.lastX = pos.x;
        pdata.lastY = pos.y;
        if (this.pointers.size === 2) {
            let [pa, pb] = this.pointers.values();
            let dx = pa.lastX - pb.lastX;
            let dy = pa.lastY - pb.lastY;
            let secondDist = Math.sqrt(dx * dx + dy * dy);
            let center = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Point((pa.lastX + pb.lastX) / 2, (pa.lastY + pb.lastY) / 2);
            this.zoom((secondDist / firstDist), center.x, center.y);
        }
    }
    onResourceEdited(res, changes) {
        if (res.type !== BOARD_TRANSFORM_TYPE)
            return;
        let t = res;
        this.board.position.set(t.posX, t.posY);
        this.board.scale.set(t.scaleX, t.scaleY);
    }
    updatePointerFollowers(point) {
        for (let c of this.world.storages.get(_component__WEBPACK_IMPORTED_MODULE_2__.FOLLOW_MOUSE_TYPE).allComponents()) {
            this.world.editComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_2__.POSITION_TYPE, {
                x: point.x,
                y: point.y,
            });
        }
    }
    /**
     * Make the board's center and the window's center overlap.
     * This way the initial board position is centered to the root card.
     */
    centerBoard() {
        let boardScreenWidth = _index__WEBPACK_IMPORTED_MODULE_1__.app.renderer.width;
        let boardScreenHeight = _index__WEBPACK_IMPORTED_MODULE_1__.app.renderer.height;
        let screenMidPointWidth = boardScreenWidth / 2;
        let screenMidPointHeight = boardScreenHeight / 2;
        let bounds = this.board.getBounds();
        this.board.position.set(screenMidPointWidth - bounds.x - bounds.width / 2, screenMidPointHeight - bounds.y - bounds.height / 2);
    }
    applyCanvasStyle(canvas) {
        const s = canvas.style;
        s.width = "100%";
        s.height = "100%";
    }
    enable() {
        const canvas = _index__WEBPACK_IMPORTED_MODULE_1__.app.view;
        this.applyCanvasStyle(canvas);
        let cnt = document.getElementById('canvas-container');
        if (cnt === null) {
            throw "Cannot find canvas container";
        }
        _index__WEBPACK_IMPORTED_MODULE_1__.app.resizeTo = cnt;
        cnt.appendChild(canvas);
        //app.renderer.backgroundColor = 0x3e2723; // dark brown
        // PIXI
        let stage = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.display.Stage();
        _index__WEBPACK_IMPORTED_MODULE_1__.app.stage = stage;
        stage.sortableChildren = true;
        stage.group.enableSort = true;
        stage.addChild(this.board);
        stage.interactive = true;
        stage.hitArea = {
            contains(x, y) {
                return true;
            }
        };
        _index__WEBPACK_IMPORTED_MODULE_1__.app.stage.on("pointermove", this.onPointerMove, this);
        _index__WEBPACK_IMPORTED_MODULE_1__.app.stage.on("pointerdown", this.onPointerDown, this);
        _index__WEBPACK_IMPORTED_MODULE_1__.app.stage.on("pointerup", this.onPointerUp, this);
        _index__WEBPACK_IMPORTED_MODULE_1__.app.stage.on("pointerupoutside", this.onPointerUpOutside, this);
        this.wheelListener = this.onMouseWheel.bind(this);
        canvas.addEventListener("wheel", this.wheelListener);
    }
    destroy() {
        _index__WEBPACK_IMPORTED_MODULE_1__.app.stage.off("pointermove", this.onPointerMove, this);
        _index__WEBPACK_IMPORTED_MODULE_1__.app.stage.off("pointerdown", this.onPointerDown, this);
        _index__WEBPACK_IMPORTED_MODULE_1__.app.stage.off("pointerup", this.onPointerUp, this);
        _index__WEBPACK_IMPORTED_MODULE_1__.app.stage.off("pointerupoutside", this.onPointerUpOutside, this);
        _index__WEBPACK_IMPORTED_MODULE_1__.app.view.removeEventListener('wheel', this.wheelListener);
        let cnt = document.getElementById('canvas-container');
        cnt === null || cnt === void 0 ? void 0 : cnt.removeChild(_index__WEBPACK_IMPORTED_MODULE_1__.app.view);
        _index__WEBPACK_IMPORTED_MODULE_1__.app.resizeTo = window;
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/pixiGraphicSystem.ts":
/*!**************************************************!*\
  !*** ./src/app/ecs/systems/pixiGraphicSystem.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "REMEMBER_TYPE": () => (/* binding */ REMEMBER_TYPE),
/* harmony export */   "POINT_RADIUS": () => (/* binding */ POINT_RADIUS),
/* harmony export */   "PIXI_GRAPHIC_TYPE": () => (/* binding */ PIXI_GRAPHIC_TYPE),
/* harmony export */   "PixiGraphicSystem": () => (/* binding */ PixiGraphicSystem)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./src/app/ecs/component.ts");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../storage */ "./src/app/ecs/storage.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../graphics */ "./src/app/graphics.ts");
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../index */ "./src/app/index.ts");
/* harmony import */ var pixi_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/pixi.es.js");
/* harmony import */ var _util_pixi__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../util/pixi */ "./src/app/util/pixi.ts");
/* harmony import */ var _game_grid__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../game/grid */ "./src/app/game/grid.ts");
/* harmony import */ var _playerSystem__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./playerSystem */ "./src/app/ecs/systems/playerSystem.ts");
/* harmony import */ var _lightSystem__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./lightSystem */ "./src/app/ecs/systems/lightSystem.ts");
/* harmony import */ var _interactionSystem__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./interactionSystem */ "./src/app/ecs/systems/interactionSystem.ts");
/* harmony import */ var _util_bitSet__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../util/bitSet */ "./src/app/util/bitSet.ts");
/* harmony import */ var _geometry_aabb__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../geometry/aabb */ "./src/app/geometry/aabb.ts");
/* harmony import */ var _geometry_obb__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../geometry/obb */ "./src/app/geometry/obb.ts");
/* harmony import */ var _geometry_line__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../geometry/line */ "./src/app/geometry/line.ts");
/* harmony import */ var _util_array__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../util/array */ "./src/app/util/array.ts");
/* harmony import */ var _gridSystem__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./gridSystem */ "./src/app/ecs/systems/gridSystem.ts");
/* harmony import */ var _pixiBoardSystem__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./pixiBoardSystem */ "./src/app/ecs/systems/pixiBoardSystem.ts");
/* harmony import */ var _textSystem__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./textSystem */ "./src/app/ecs/systems/textSystem.ts");



















const REMEMBER_TYPE = 'remember';
var VisibListenerLevel;
(function (VisibListenerLevel) {
    VisibListenerLevel[VisibListenerLevel["NOT_NEEDED"] = 0] = "NOT_NEEDED";
    VisibListenerLevel[VisibListenerLevel["REMEMBER"] = 1] = "REMEMBER";
    VisibListenerLevel[VisibListenerLevel["PERSISTENT"] = 2] = "PERSISTENT";
})(VisibListenerLevel || (VisibListenerLevel = {}));
function lerpColor(a, b, t) {
    let tr = ((a >> 16) & 0xFF) * (1 - t) + ((b >> 16) & 0xFF) * t;
    let tg = ((a >> 8) & 0xFF) * (1 - t) + ((b >> 8) & 0xFF) * t;
    let tb = (a & 0xFF) * (1 - t) + (b & 0xFF) * t;
    return tr << 16 | tg << 8 | tb;
}
const POINT_RADIUS = 12;
const PIXI_GRAPHIC_TYPE = 'pixi_graphic';
/**
 * Manages:
 * - Drawing elements
 * - Selection highlighting
 * - Element visibility/remembering
 * - Layer ordering
 * - Position/Translation updates
 * - Bit-by-bit remembering (background discovery)
 * - Interaction setup
 *
 * TODO: we could use a ParticleSystem in some instances
 */
class PixiGraphicSystem {
    constructor(world) {
        this.name = PIXI_GRAPHIC_TYPE;
        this.dependencies = [_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_17__.PIXI_BOARD_TYPE, _interactionSystem__WEBPACK_IMPORTED_MODULE_10__.INTERACTION_TYPE];
        this.provides = [_graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE];
        this.storage = new _storage__WEBPACK_IMPORTED_MODULE_1__.SingleEcsStorage(_graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE, false, false);
        this.rememberStorage = new _storage__WEBPACK_IMPORTED_MODULE_1__.FlagEcsStorage(REMEMBER_TYPE, true, true);
        this.renderTexturePool = new pixi_js__WEBPACK_IMPORTED_MODULE_5__.RenderTexturePool();
        this.masterVisibility = false;
        this.world = world;
        this.textSystem = world.systems.get(_textSystem__WEBPACK_IMPORTED_MODULE_18__.TEXT_TYPE);
        this.pixiBoardSystem = world.systems.get(_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_17__.PIXI_BOARD_TYPE);
        this.interactionSystem = world.systems.get(_interactionSystem__WEBPACK_IMPORTED_MODULE_10__.INTERACTION_TYPE);
        world.addStorage(this.rememberStorage);
        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_removed', this.onComponentRemoved, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
        world.events.on('selection_begin', this.onSelectionBegin, this);
        world.events.on('selection_end', this.onSelectionEnd, this);
        world.events.on(_playerSystem__WEBPACK_IMPORTED_MODULE_8__.EVENT_VISIBILITY_SPREAD, this.onBBBVisibilitySpread, this);
        world.events.on('serialize', this.onSerialize, this);
        world.events.on('serialize_entity', this.onSerializeEntity, this);
    }
    onComponentAdd(c) {
        let spreadVis = false;
        let com = undefined;
        if (c.type === _graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE) {
            com = c;
            let pos = this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
            let trans = this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_0__.TRANSFORM_TYPE);
            this.updateInteractive(com, pos, trans);
            this.updateElement(com, com.display, pos, trans, true);
            this.updateVisibilityListener(com);
            let pv = this.world.getComponent(c.entity, _playerSystem__WEBPACK_IMPORTED_MODULE_8__.PLAYER_VISIBLE_TYPE);
            let remembered = this.world.getComponent(c.entity, REMEMBER_TYPE) !== undefined;
            this.updateElementVisibility(com, com.display, true, !!(pv === null || pv === void 0 ? void 0 : pv.visible), remembered);
            com._bitByBit = this.needsBitByBit(com, com.display);
            spreadVis = com._bitByBit;
        }
        else if (c.type === _component__WEBPACK_IMPORTED_MODULE_0__.TRANSFORM_TYPE) {
            com = this.storage.getComponent(c.entity);
            if (com === undefined)
                return;
            let pos = this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
            let trans = c;
            this.updateElement(com, com.display, pos, trans, true);
            spreadVis = !!com._bitByBit;
        }
        else if (c.type === REMEMBER_TYPE) {
            com = this.storage.getComponent(c.entity);
            if (com === undefined)
                return;
            this.updateElementVisibility(com, com.display, true, true, true);
        }
        else if (c.type === _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE) {
            // TODO: here?
        }
        if (spreadVis && com !== undefined) {
            this.updateBBBVisAround(com);
        }
    }
    onComponentEdited(c, changes) {
        var _a;
        let spreadVis = false;
        let com = undefined;
        if (c.type === _graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE) {
            com = c;
            let pos = this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
            let trans = this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_0__.TRANSFORM_TYPE);
            this.runMethods(com, com.display); // run delayed methods (like _childrenAdd, _childrenReplace & co).
            this.updateInteractive(com, pos, trans);
            this.updateElement(com, com.display, pos, trans, true);
            let pv = this.world.getComponent(c.entity, _playerSystem__WEBPACK_IMPORTED_MODULE_8__.PLAYER_VISIBLE_TYPE);
            let remembered = this.rememberStorage.getComponent(c.entity) !== undefined;
            this.updateElementVisibility(com, com.display, true, (_a = pv === null || pv === void 0 ? void 0 : pv.visible) !== null && _a !== void 0 ? _a : true, remembered);
            com._bitByBit = this.needsBitByBit(com, com.display);
            spreadVis = com._bitByBit;
            if ('interactive' in changes) {
                this.updateInteractive(com, pos, trans);
            }
        }
        else if (c.type === _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE) {
            com = this.storage.getComponent(c.entity);
            if (com === undefined)
                return;
            let pos = c;
            let trans = this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_0__.TRANSFORM_TYPE);
            this.updateElement(com, com.display, pos, trans, true);
            spreadVis = !!com._bitByBit;
        }
        else if (c.type === _component__WEBPACK_IMPORTED_MODULE_0__.TRANSFORM_TYPE) {
            com = this.storage.getComponent(c.entity);
            if (com === undefined)
                return;
            let pos = this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
            let trans = c;
            this.updateElement(com, com.display, pos, trans, true);
            spreadVis = !!com._bitByBit;
        }
        else if (c.type === _playerSystem__WEBPACK_IMPORTED_MODULE_8__.PLAYER_VISIBLE_TYPE) {
            let pv = c;
            com = this.storage.getComponent(pv.entity);
            if (com === undefined)
                return;
            let remembered = false;
            if (com._visibListener === VisibListenerLevel.REMEMBER && pv.visible) {
                this.world.addComponent(c.entity, {
                    type: REMEMBER_TYPE,
                    entity: c.entity,
                });
                this.playerSystem.removePlayerVisListener(c.entity);
                remembered = true;
            }
            if (!this.masterVisibility) {
                this.updateElementVisibility(com, com.display, true, pv.visible, remembered);
            }
        }
        if (spreadVis && com !== undefined) {
            this.updateBBBVisAround(com);
        }
    }
    onComponentRemoved(c) {
        if (c.type === _graphics__WEBPACK_IMPORTED_MODULE_2__.GRAPHIC_TYPE) {
            this.destroyElement(c.display, true);
        }
        else if (c.type === _component__WEBPACK_IMPORTED_MODULE_0__.TRANSFORM_TYPE) {
            let com = this.storage.getComponent(c.entity);
            if (com === undefined)
                return;
            let pos = this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
            this.updateElement(com, com.display, pos, c, true);
        }
        else if (c.type === _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE) {
            let com = this.storage.getComponent(c.entity);
            if (com === undefined || !com._bitByBit)
                return;
            // Now you're visible! say hello
            this.updateBBBVisAround(com);
        }
    }
    onResourceEdited(res, changes) {
        if (res.type === 'local_light_settings') {
            let set = res;
            if (!('visionType' in changes))
                return;
            if (set.visionType === 'dm') {
                this.masterVisibility = true;
                for (let c of this.storage.allComponents()) {
                    this.updateElementVisibility(c, c.display, true, true, true);
                }
            }
            else if (set.visionType === 'rp') {
                this.masterVisibility = false;
                for (let c of this.storage.allComponents()) {
                    let pv = this.world.getComponent(c.entity, 'player_visible');
                    let rem = this.rememberStorage.getComponent(c.entity);
                    this.updateElementVisibility(c, c.display, true, pv === null || pv === void 0 ? void 0 : pv.visible, rem !== undefined);
                }
            }
            else {
                throw 'Unknown vision type';
            }
        }
        else if (res.type === _gridSystem__WEBPACK_IMPORTED_MODULE_16__.GRID_TYPE) {
            if (!('width' in changes))
                return;
            // You are literally satan, I hate you.
            let posSto = this.world.storages.get(_component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
            let tranSto = this.world.storages.get(_component__WEBPACK_IMPORTED_MODULE_0__.TRANSFORM_TYPE);
            for (let c of this.storage.allComponents()) {
                this.forEachEl(c, c.display, e => {
                    if (e.type === _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.IMAGE && e.scale === _graphics__WEBPACK_IMPORTED_MODULE_2__.ImageScaleMode.GRID) {
                        let pos = posSto.getComponent(c.entity);
                        let tran = tranSto.getComponent(c.entity);
                        this.updateElement(c, e, pos, tran, false);
                        this.world.editComponent(c.entity, _interactionSystem__WEBPACK_IMPORTED_MODULE_10__.INTERACTION_TYPE, { shape: this.createShape(e, pos, tran) });
                    }
                });
            }
        }
    }
    onSelectionBegin(entity) {
        let c = this.storage.getComponent(entity);
        if (c !== undefined) {
            c._selected = true;
            let pos = this.world.getComponent(entity, _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
            let trans = this.world.getComponent(entity, _component__WEBPACK_IMPORTED_MODULE_0__.TRANSFORM_TYPE);
            this.updateElement(c, c.display, pos, trans, true);
        }
    }
    onSelectionEnd(entity) {
        let c = this.storage.getComponent(entity);
        if (c !== undefined) {
            c._selected = false;
            let pos = this.world.getComponent(entity, _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
            let trans = this.world.getComponent(entity, _component__WEBPACK_IMPORTED_MODULE_0__.TRANSFORM_TYPE);
            this.updateElement(c, c.display, pos, trans, true);
        }
    }
    onBBBVisibilitySpread(data) {
        let iter = this.interactionSystem.query((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_10__.shapeAabb)(data.aabb), c => {
            let com = this.storage.getComponent(c.entity);
            return com !== undefined && com._bitByBit === true;
        });
        for (let c of iter) {
            // If we are here then the component exists, we checked it in the iterator
            let cmp = this.storage.getComponent(c.entity);
            this.doOnBitByBit(cmp, cmp.display, (img) => this.updateBBBVisibility(data, cmp, img));
        }
    }
    onSerialize() {
        let changedList = [];
        for (let com of this.storage.allComponents()) {
            if (!com._bitByBit)
                continue;
            let changed = false;
            this.doOnBitByBit(com, com.display, (img) => changed || (changed = this.extractVisibility(img)));
            if (changed)
                changedList.push(com.entity);
        }
        if (changedList) {
            this.world.events.emit(_graphics__WEBPACK_IMPORTED_MODULE_2__.EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE, changedList);
        }
    }
    onSerializeEntity(entity) {
        let c = this.storage.getComponent(entity);
        if (c === undefined)
            return;
        let changed = false;
        this.doOnBitByBit(c, c.display, (img) => changed || (changed = this.extractVisibility(img)));
        if (changed) {
            this.world.events.emit(_graphics__WEBPACK_IMPORTED_MODULE_2__.EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE, [entity]);
        }
    }
    // -------------------------- LISTENERS DONE --------------------------
    updateInteractive(comp, pos, trans) {
        let interactiveCmp = this.world.getComponent(comp.entity, _interactionSystem__WEBPACK_IMPORTED_MODULE_10__.INTERACTION_TYPE);
        if (comp.interactive && interactiveCmp === undefined) {
            this.world.addComponent(comp.entity, {
                type: _interactionSystem__WEBPACK_IMPORTED_MODULE_10__.INTERACTION_TYPE,
                selectPriority: comp.display.priority,
                snapEnabled: true,
                shape: this.createShape(comp.display, pos, trans),
            });
        }
        else if (!comp.interactive && interactiveCmp !== undefined) {
            this.world.removeComponent(interactiveCmp);
        }
        else if (comp.interactive) {
            // Check for component changes in interactor
            if (comp.display.type === _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.IMAGE) {
                // If the texture has changed we need to update the interactor.
                let el = comp.display;
                if (el.texture !== el._oldTex) {
                    this.world.editComponent(comp.entity, _interactionSystem__WEBPACK_IMPORTED_MODULE_10__.INTERACTION_TYPE, { shape: this.createShape(el, pos, trans) });
                }
            }
        }
    }
    createShape(comp, pos, trans) {
        switch (comp.type) {
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.CONTAINER:
                // Only the root element can be made interactive, the others are ignored
                throw 'Cannot make interactive container';
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.TEXT:
                throw 'Cannot make interactive text';
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.IMAGE: {
                let c = comp;
                let w = c.texture.width;
                let h = c.texture.height;
                let aabb;
                let sx = (trans === null || trans === void 0 ? void 0 : trans.scale) || 1;
                let sy = (trans === null || trans === void 0 ? void 0 : trans.scale) || 1;
                if (c.scale == _graphics__WEBPACK_IMPORTED_MODULE_2__.ImageScaleMode.GRID) {
                    this.textureUpdateGridSize(c.texture);
                    let grid = this.world.getResource(_gridSystem__WEBPACK_IMPORTED_MODULE_16__.GRID_TYPE);
                    let gsize = c.texture.gridSize;
                    sx = gsize.x * grid.size * sx;
                    sy = gsize.y * grid.size * sy;
                }
                aabb = _geometry_aabb__WEBPACK_IMPORTED_MODULE_12__.Aabb.fromPointAnchor(pos, { x: w, y: h }, c.anchor);
                aabb.scale(sx, sy, aabb);
                let obb = _geometry_obb__WEBPACK_IMPORTED_MODULE_13__.Obb.rotateAabb(aabb.copy(), (trans === null || trans === void 0 ? void 0 : trans.rotation) || 0);
                return (0,_interactionSystem__WEBPACK_IMPORTED_MODULE_10__.shapeObb)(obb);
            }
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.LINE: {
                let c = comp;
                return (0,_interactionSystem__WEBPACK_IMPORTED_MODULE_10__.shapeLine)(new _geometry_line__WEBPACK_IMPORTED_MODULE_14__.Line(pos.x, pos.y, pos.x + c.vec.x, pos.y + c.vec.y));
            }
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.POINT: {
                return (0,_interactionSystem__WEBPACK_IMPORTED_MODULE_10__.shapePoint)(new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Point(pos.x, pos.y));
            }
        }
    }
    /**
     * Extracts visibility from the rendertexture of the image (must be VISBLE_BIT_BY_BIT).
     *
     * @param c the image from which the visibility map will be extracted.
     * @return true only if the visibility map has been modified.
     * @private
     */
    extractVisibility(c) {
        if (c._visMapChanged !== true)
            return false;
        c.visMap = undefined;
        const renderer = _index__WEBPACK_IMPORTED_MODULE_4__.app.renderer;
        const tex = c._renTex;
        if (tex === undefined)
            return false;
        let frame = tex.frame;
        renderer.renderTexture.bind(tex);
        let webglPixels = new Uint8Array(tex.width * tex.height * 4);
        const gl = renderer.gl;
        gl.readPixels(frame.x, frame.y, frame.width, frame.height, gl.RGBA, gl.UNSIGNED_BYTE, webglPixels);
        let fuckLen = webglPixels.length / 4;
        let newLen = ((webglPixels.length / 4 - 1) >>> 5) + 1;
        let target = new Uint32Array(newLen);
        for (let i = 0; i < fuckLen; i++) {
            let pixel = webglPixels[i * 4 + 3];
            if ((pixel & 0x80) !== 0) {
                target[i >>> 5] |= 1 << (i & 0b11111);
            }
        }
        c.visMap = target;
        c._visMapChanged = false;
        return true;
    }
    loadVisibility(c) {
        const width = c.texture.width;
        const height = c.texture.height;
        if (c._renTex === undefined) {
            c._renTex = _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.RenderTexture.create({
                width, height,
                scaleMode: c.texture.baseTexture.scaleMode,
            });
            let bt = c._renTex.baseTexture;
            bt.clearColor = [0.0, 0.0, 0.0, 0.0];
        }
        if (c.visMap === undefined)
            return;
        let texOpts = {
            width, height,
            format: _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.FORMATS.RGBA,
        };
        let texData = new Uint32Array(c.texture.width * c.texture.height);
        let set = new _util_bitSet__WEBPACK_IMPORTED_MODULE_11__.BitSet(c.visMap);
        let len = texData.length;
        for (let i = 0; i < len; i++) {
            texData[i] = set.get(i) ? 0xFFFFFFFF : 0;
        }
        let byteData = new Uint8Array(texData.buffer);
        let resource = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.resources.BufferResource(byteData, { width, height });
        let baseTexture = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.BaseTexture(resource, texOpts);
        let tex = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Texture(baseTexture);
        let lumSprite = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Sprite(tex);
        lumSprite.blendMode = _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.BLEND_MODES.SRC_IN;
        let mapSprite = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Sprite(c.texture);
        let cnt = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Container();
        cnt.addChild(mapSprite, lumSprite);
        _index__WEBPACK_IMPORTED_MODULE_4__.app.renderer.render(cnt, c._renTex, true);
        lumSprite.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_6__.DESTROY_ALL);
        c._visMapChanged = false;
    }
    forEachEl(com, img, f) {
        f(img);
        if (img.children) {
            for (let c of img.children) {
                this.forEachEl(com, c, f);
            }
        }
    }
    doOnBitByBit(com, img, f) {
        if (img.type == _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.IMAGE && img.visib === _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.REMEMBER_BIT_BY_BIT) {
            f(img);
        }
        if (img.children) {
            for (let c of img.children) {
                this.doOnBitByBit(com, c, f);
            }
        }
    }
    needsBitByBit(com, img) {
        if (img.type == _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.IMAGE && img.visib === _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.REMEMBER_BIT_BY_BIT) {
            return true;
        }
        if (img.children) {
            for (let c of img.children) {
                if (this.needsBitByBit(com, c))
                    return true;
            }
        }
        return false;
    }
    updateBBBVisAround(com) {
        let inter = this.world.getComponent(com.entity, _interactionSystem__WEBPACK_IMPORTED_MODULE_10__.INTERACTION_TYPE);
        let aabb = (0,_interactionSystem__WEBPACK_IMPORTED_MODULE_10__.shapeToAabb)(inter.shape);
        this.playerSystem.getSpreadDataForAabb(aabb, data => {
            this.doOnBitByBit(com, com.display, (img) => this.updateBBBVisibility(data, com, img));
        });
    }
    updateBBBVisibility(data, com, img) {
        //      Part 1. What?
        // So, what does this spaghetti mess do? Good question!
        // We have players and lights, some players can see without lights and others can't
        // The task is to update the rendertexture of the background component adding the visible spots to it.
        // The visible spots are: The meshes of the players with night vision enabled and the intersection of the
        // union of the vision mesh of the normal players with the union of the vison meshes of the lights.
        // Common case: 1 NV player 0 lights, 1 player multiple lights, multiple players 1 light
        // Possible (but uncommon) cases: x NV players, y normal players, z lights (with x, y, z naturals).
        //      Part 2. How?
        // The initial idea is simple, render anything on the bkg._renTex and then render the original texture with
        // blendMode = SRC_IN, any spot with alpha = 1 will then be replaced with the correct texture.
        // The night vision players rendering is quite simple, just render the meshes before the final texture render
        // The normal players will be a bit different since we need to intersect their meshes with the light mesh.
        // To do that we can render all the players meshes in a framebuffer A, then render all of the lights in another
        // frame buffer B, then render A onto B with blendMode = SRC_IN to create a sort of union of the two.
        // Once that is done we can render B into the bkg._renTex and proceed normally.
        // Another way to do this using only a single rendertexture is to use the stencil buffer, but it will double the
        // mesh render calls (and since they are not buffered, it's a slow operation)
        // I don't think that there is another way to perform this in the general case, please prove me wrong.
        // TODO: maybe we can optimize this when only 1 player and 1 light is present (like, avoiding 1 of the 2 framebuffers).
        // Skip EVERYTHING if this entity is hidden.
        if (this.world.getComponent(com.entity, _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE))
            return;
        //console.time('updateVisibility');
        let renderer = _index__WEBPACK_IMPORTED_MODULE_4__.app.renderer;
        let localCnt = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Container();
        // Setup local transform
        let m = new pixi_js__WEBPACK_IMPORTED_MODULE_5__.Matrix();
        let pixi = img._pixi;
        m.translate(-pixi.position.x, -pixi.position.y);
        m.rotate(-pixi.rotation);
        let invScale = 1 / pixi.scale.x;
        m.scale(invScale, invScale);
        m.translate(img.texture.width / 2, img.texture.height / 2);
        localCnt.transform.setFromMatrix(m);
        let worldCnt = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Container();
        // If there are any players without night vision (and there are lights) render them (THIS IS SLOW!)
        let tex, tex2, nightSprite;
        if (data.players.length !== 0 && data.lights.length !== 0) {
            tex = this.renderTexturePool.getOptimalTexture(pixi.width, pixi.height);
            tex2 = this.renderTexturePool.getOptimalTexture(pixi.width, pixi.height);
            for (let player of data.players) {
                localCnt.addChild(player.mesh);
            }
            // Render the players visibility meshes onto tex
            renderer.render(localCnt, tex, true);
            localCnt.removeChildren();
            for (let light of data.lights) {
                light.mesh.blendMode = _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.BLEND_MODES.ADD;
                localCnt.addChild(light.mesh);
            }
            let playerSprite = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Sprite(tex);
            playerSprite.blendMode = pixi_js__WEBPACK_IMPORTED_MODULE_5__.BLEND_MODES.SRC_IN;
            // Render the lights onto tex2, then render tex as BLEND_MODE.SRC_IN to filter out where the lights were not
            // present.
            worldCnt.addChild(localCnt, playerSprite);
            renderer.render(worldCnt, tex2, true);
            worldCnt.removeChildren();
            localCnt.removeChildren();
            // Add tex2 to the main phase
            nightSprite = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Sprite(tex2);
            nightSprite.blendMode = _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.BLEND_MODES.ADD;
            worldCnt.addChild(nightSprite);
        }
        for (let player of data.nightVisPlayers) {
            localCnt.addChild(player.mesh);
        }
        let origTex = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Sprite(img.texture);
        origTex.blendMode = _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.BLEND_MODES.SRC_IN;
        worldCnt.addChild(localCnt, origTex);
        // Render everything to bkg._renTex and then redraw the original only where is alpha=1.
        _index__WEBPACK_IMPORTED_MODULE_4__.app.renderer.render(worldCnt, img._renTex, false);
        img._visMapChanged = true;
        // Cleanup time (don't worry, I'm recycling and there's a garbage cleaner, we're eco friendly!)
        worldCnt.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_6__.DESTROY_MIN);
        origTex.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_6__.DESTROY_MIN);
        if (tex !== undefined)
            this.renderTexturePool.returnTexture(tex);
        if (tex2 !== undefined)
            this.renderTexturePool.returnTexture(tex2);
        if (nightSprite !== undefined)
            nightSprite.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_6__.DESTROY_MIN);
        //console.timeEnd('updateVisibility');
    }
    computeVisibilityListener(c) {
        let level;
        switch (c.visib) {
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.NORMAL:
                // Already maximum level, no need for further checking
                return VisibListenerLevel.PERSISTENT;
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.ALWAYS_VISIBLE:
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.REMEMBER_BIT_BY_BIT:
                level = VisibListenerLevel.NOT_NEEDED;
                break;
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.REMEMBER:
                level = VisibListenerLevel.REMEMBER;
                break;
        }
        if (c.children) {
            for (let ch of c.children) {
                level = Math.max(level, this.computeVisibilityListener(ch));
                if (level === VisibListenerLevel.PERSISTENT)
                    break; // Already maxed out.
            }
        }
        return level;
    }
    destroyElement(desc, recursive) {
        let elem = desc._pixi;
        if (elem === undefined)
            return;
        switch (desc._oldType) {
            case undefined:
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.CONTAINER:
                break;
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.IMAGE: {
                let im = desc;
                let destroyTex = im.sharedTexture !== true;
                elem.destroy({
                    children: false,
                    texture: destroyTex,
                    baseTexture: destroyTex,
                });
                if (im._renTex !== undefined) {
                    im._renTex.destroy(true);
                }
                break;
            }
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.LINE:
                elem.destroy({
                    children: false,
                    texture: true,
                    baseTexture: true,
                });
                break;
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.POINT:
                elem.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_6__.DESTROY_MIN);
                break;
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.TEXT:
                elem.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_6__.DESTROY_MIN);
                break;
        }
        desc._pixi = undefined;
        desc._oldType = undefined;
        if (recursive && desc.children) {
            for (let el of desc.children) {
                this.destroyElement(el, true);
            }
        }
    }
    createElement(desc) {
        this.destroyElement(desc, false);
        let res;
        // TODO: Layers
        switch (desc.type) {
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.CONTAINER:
                res = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Container();
                break;
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.IMAGE:
                res = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Sprite();
                break;
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.LINE:
                res = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Graphics();
                break;
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.POINT:
                res = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Sprite(this.circleTex);
                break;
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.TEXT:
                res = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Text("");
                res.parentLayer = this.textSystem.textLayer;
                break;
        }
        res.interactive = false;
        res.interactiveChildren = false;
        res.zIndex = desc.priority;
        desc._pixi = res;
        desc._oldType = desc.type;
        this.pixiBoardSystem.board.addChild(res);
        this.pixiBoardSystem.board.sortChildren();
    }
    textureUpdateGridSize(tex) {
        let texId = tex._updateID;
        if (tex.gridSize !== undefined && tex.gridSize.updateId !== texId)
            return;
        tex.gridSize = {
            x: Math.ceil(tex.width / _game_grid__WEBPACK_IMPORTED_MODULE_7__.STANDARD_GRID_OPTIONS.size) / tex.width,
            y: Math.ceil(tex.height / _game_grid__WEBPACK_IMPORTED_MODULE_7__.STANDARD_GRID_OPTIONS.size) / tex.height,
            updateId: texId,
        };
    }
    updateElementVisibility(par, desc, recursive, currentlyVisible, remembered) {
        let isVisible;
        if (currentlyVisible || this.masterVisibility) {
            isVisible = true;
        }
        else {
            switch (desc.visib) {
                case _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.NORMAL:
                    isVisible = currentlyVisible;
                    break;
                case _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.ALWAYS_VISIBLE:
                case _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.REMEMBER_BIT_BY_BIT:
                    isVisible = true;
                    break;
                case _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.REMEMBER:
                    isVisible = remembered;
                    break;
            }
        }
        let pixi = desc._pixi;
        pixi.visible = isVisible;
        if (desc.visib === _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.REMEMBER_BIT_BY_BIT) {
            let im = desc;
            im._pixi.texture = this.masterVisibility ? im.texture : im._renTex;
        }
        if (recursive && desc.children) {
            for (let c of desc.children) {
                this.updateElementVisibility(par, c, true, currentlyVisible, remembered);
            }
        }
    }
    updateVisibilityListener(el) {
        let listLevel = this.computeVisibilityListener(el.display);
        let oldListLevel = el._visibListener || VisibListenerLevel.NOT_NEEDED;
        if (listLevel === oldListLevel)
            return; // No changes reported.
        let isRemembered = this.rememberStorage.getComponent(el.entity);
        let listenerNeeded;
        switch (listLevel) {
            case VisibListenerLevel.NOT_NEEDED:
                listenerNeeded = false;
                break;
            case VisibListenerLevel.REMEMBER:
                listenerNeeded = !isRemembered;
                break;
            case VisibListenerLevel.PERSISTENT:
                listenerNeeded = true;
                break;
        }
        let oldListenerNeeded;
        switch (oldListLevel) {
            case VisibListenerLevel.NOT_NEEDED:
                oldListenerNeeded = false;
                break;
            case VisibListenerLevel.REMEMBER:
                oldListenerNeeded = !isRemembered;
                break;
            case VisibListenerLevel.PERSISTENT:
                oldListenerNeeded = true;
                break;
        }
        // Why before? good question!
        // when we add the listener we could discover instantly that the visibility is present, thus calling
        // a callback to this system saying "hi, this element in which there's a visibility listener is visible"
        // if we set the listener after this the system will say "oh really, but there's no listener on this element"
        // (yeah I spent way too much time to debug this)
        el._visibListener = listLevel;
        if (listenerNeeded && !oldListenerNeeded) {
            this.playerSystem.addPlayerVisListener(el.entity, el.isWall);
        }
        else if (!listenerNeeded && oldListenerNeeded) {
            this.playerSystem.removePlayerVisListener(el.entity);
        }
    }
    runMethods(par, el) {
        if (el._childrenReplace) {
            if (el.children) {
                for (let c of el.children) {
                    this.destroyElement(c, true);
                }
                el.children.length = 0;
            }
            el._childrenAdd = el._childrenReplace;
            el._childrenReplace = undefined;
        }
        if (el._childrenAdd) {
            if (el.children === undefined)
                el.children = [];
            el.children.push(...el._childrenAdd);
            el._childrenAdd = undefined;
        }
        if (el._childrenRemove) {
            if (el.children === undefined)
                return;
            for (let c of el._childrenRemove) {
                this.destroyElement(c, true);
                (0,_util_array__WEBPACK_IMPORTED_MODULE_15__.arrayRemoveElem)(el.children, c);
            }
            el._childrenRemove = undefined;
        }
        if (el.children) {
            for (let c of el.children) {
                this.runMethods(par, c);
            }
        }
    }
    updateElement(par, desc, pos, trans, recursive) {
        if (desc._oldType !== desc.type) {
            this.createElement(desc);
        }
        let d = desc._pixi;
        if (desc.offset !== undefined) {
            d.position.set(pos.x + desc.offset.x, pos.y + desc.offset.y);
        }
        else {
            d.position.set(pos.x, pos.y);
        }
        switch (desc.type) {
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.CONTAINER:
                break;
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.IMAGE: {
                let dim = d;
                let el = desc;
                if (el.visib == _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.REMEMBER_BIT_BY_BIT) {
                    dim.texture = this.masterVisibility ? el.texture : el._renTex;
                }
                else {
                    dim.texture = el.texture;
                }
                dim.anchor.copyFrom(el.anchor);
                let sx = (trans === null || trans === void 0 ? void 0 : trans.scale) || 1;
                let sy = sx;
                if (el.scale === _graphics__WEBPACK_IMPORTED_MODULE_2__.ImageScaleMode.GRID) {
                    this.textureUpdateGridSize(dim.texture);
                    let grid = this.world.getResource(_gridSystem__WEBPACK_IMPORTED_MODULE_16__.GRID_TYPE);
                    let gsize = dim.texture.gridSize;
                    sx = gsize.x * grid.size * sx;
                    sy = gsize.y * grid.size * sy;
                }
                dim.rotation = (trans === null || trans === void 0 ? void 0 : trans.rotation) || 0;
                dim.scale.set(sx, sy);
                dim.tint = par._selected ? 0x7986CB : 0xFFFFFF;
                if (el.visib === _graphics__WEBPACK_IMPORTED_MODULE_2__.VisibilityType.REMEMBER_BIT_BY_BIT) {
                    if (el._oldTex !== el.texture) {
                        this.loadVisibility(el);
                    }
                }
                else if (el._renTex !== undefined) {
                    el._renTex.destroy(true);
                    el._renTex = undefined;
                }
                el._oldTex = el.texture;
                break;
            }
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.LINE: {
                let g = d;
                let el = desc;
                g.clear();
                g.moveTo(0, 0);
                g.lineStyle(5, el.color);
                g.lineTo(el.vec.x, el.vec.y);
                if (par._selected) {
                    g.lineStyle(0);
                    g.beginFill(0xe51010);
                    g.drawCircle(0, 0, 10);
                    g.endFill();
                    g.beginFill(el.color);
                    g.drawCircle(el.vec.x, el.vec.y, 10);
                    g.endFill();
                }
                break;
            }
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.POINT: {
                let color = desc.color;
                if (par._selected) {
                    color = lerpColor(color, 0x7986CB, 0.3);
                }
                d.tint = color;
                break;
            }
            case _graphics__WEBPACK_IMPORTED_MODULE_2__.ElementType.TEXT: {
                let el = desc;
                let g = d;
                g.text = el.text;
                g.anchor.copyFrom(el.anchor);
                g.tint = el.color;
                break;
            }
        }
        if (recursive && desc.children) {
            for (let el of desc.children) {
                this.updateElement(par, el, pos, trans, true);
            }
        }
    }
    enable() {
        this.playerSystem = this.world.systems.get(_playerSystem__WEBPACK_IMPORTED_MODULE_8__.PLAYER_TYPE);
        this.masterVisibility = this.world.systems.get(_lightSystem__WEBPACK_IMPORTED_MODULE_9__.LIGHT_TYPE).localLightSettings.visionType === 'dm';
        let g = new _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.Graphics();
        g.beginFill(0xFFFFFF);
        g.lineStyle(0);
        g.drawCircle(POINT_RADIUS, POINT_RADIUS, POINT_RADIUS);
        this.circleTex = _index__WEBPACK_IMPORTED_MODULE_4__.app.renderer.generateTexture(g, _PIXI__WEBPACK_IMPORTED_MODULE_3__.default.SCALE_MODES.LINEAR, 1);
        this.circleTex.defaultAnchor.set(0.5, 0.5);
    }
    destroy() {
        for (let elem of this.storage.allComponents()) {
            this.destroyElement(elem.display, true);
        }
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/playerSystem.ts":
/*!*********************************************!*\
  !*** ./src/app/ecs/systems/playerSystem.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PLAYER_TYPE": () => (/* binding */ PLAYER_TYPE),
/* harmony export */   "PLAYER_VISIBLE_TYPE": () => (/* binding */ PLAYER_VISIBLE_TYPE),
/* harmony export */   "EVENT_VISIBILITY_SPREAD": () => (/* binding */ EVENT_VISIBILITY_SPREAD),
/* harmony export */   "PlayerSystem": () => (/* binding */ PlayerSystem)
/* harmony export */ });
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../storage */ "./src/app/ecs/storage.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./src/app/ecs/component.ts");
/* harmony import */ var _visibilitySystem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./visibilitySystem */ "./src/app/ecs/systems/visibilitySystem.ts");
/* harmony import */ var _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../game/pointLightRenderer */ "./src/app/game/pointLightRenderer.ts");
/* harmony import */ var _util_pixi__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../util/pixi */ "./src/app/util/pixi.ts");
/* harmony import */ var _visibilityAwareSystem__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./visibilityAwareSystem */ "./src/app/ecs/systems/visibilityAwareSystem.ts");
/* harmony import */ var _lightSystem__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./lightSystem */ "./src/app/ecs/systems/lightSystem.ts");
/* harmony import */ var _pinSystem__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./pinSystem */ "./src/app/ecs/systems/pinSystem.ts");
/* harmony import */ var _gridSystem__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./gridSystem */ "./src/app/ecs/systems/gridSystem.ts");
/* harmony import */ var _game_grid__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../game/grid */ "./src/app/game/grid.ts");










const PLAYER_TYPE = 'player';
/**
 * Added to every object that might be visible by a player, it tracks how many players and how many lights
 * are seeing it.
 */
const PLAYER_VISIBLE_TYPE = 'player_visible';
const EVENT_VISIBILITY_SPREAD = 'visibility_spread';
class PlayerSystem {
    constructor(world) {
        var _a;
        this.name = PLAYER_TYPE;
        this.dependencies = [_pinSystem__WEBPACK_IMPORTED_MODULE_7__.PIN_TYPE, _visibilitySystem__WEBPACK_IMPORTED_MODULE_2__.VISIBILITY_TYPE, _visibilityAwareSystem__WEBPACK_IMPORTED_MODULE_5__.VISIBILITY_AWARE_TYPE];
        this.storage = new _storage__WEBPACK_IMPORTED_MODULE_0__.SingleEcsStorage(PLAYER_TYPE, true, true);
        this.visibleStorage = new _storage__WEBPACK_IMPORTED_MODULE_0__.SingleEcsStorage(PLAYER_VISIBLE_TYPE, false, false);
        // If false a player can see a thing only if it's illuminated by artificial light
        this.ambientIlluminated = false;
        this.world = world;
        this.lightSystem = world.systems.get(_lightSystem__WEBPACK_IMPORTED_MODULE_6__.LIGHT_TYPE);
        this.visibilitySystem = world.systems.get(_visibilitySystem__WEBPACK_IMPORTED_MODULE_2__.VISIBILITY_TYPE);
        this.gridSize = ((_a = this.world.getResource(_gridSystem__WEBPACK_IMPORTED_MODULE_8__.GRID_TYPE)) !== null && _a !== void 0 ? _a : _game_grid__WEBPACK_IMPORTED_MODULE_9__.STANDARD_GRID_OPTIONS).size;
        this.world.addStorage(this.storage);
        this.world.addStorage(this.visibleStorage);
        this.world.events.on('component_add', this.onComponentAdd, this);
        this.world.events.on('component_edited', this.onComponentEdited, this);
        this.world.events.on('component_remove', this.onComponentRemove, this);
        this.world.events.on('resource_edited', this.onResourceEdited, this);
        let visAware = world.systems.get(_visibilityAwareSystem__WEBPACK_IMPORTED_MODULE_5__.VISIBILITY_AWARE_TYPE);
        visAware.events.on('aware_update', this.onVisibilityAwareUpdate, this);
    }
    onPlayerVisibleCountersUpdate(t) {
        let newVisible = t._playerNightVisionCount > 0 ||
            ((this.ambientIlluminated || t._lightCount > 0 || t.isWall) && t._playerCount > 0);
        if (newVisible !== t.visible) {
            this.world.editComponent(t.entity, t.type, {
                visible: newVisible,
            });
        }
    }
    onVisibilityAwareUpdate(target, added, removed) {
        let playerVisible = this.visibleStorage.getComponent(target.entity);
        if (playerVisible === undefined)
            return;
        for (let e of added) {
            let player = this.storage.getComponent(e);
            if (player !== undefined) {
                playerVisible._playerCount += 1;
                if (player.nightVision)
                    playerVisible._playerNightVisionCount += 1;
                continue;
            }
            let light = this.world.getComponent(e, _lightSystem__WEBPACK_IMPORTED_MODULE_6__.LIGHT_TYPE);
            if (light !== undefined) {
                playerVisible._lightCount += 1;
            }
        }
        for (let e of removed) {
            let player = this.storage.getComponent(e);
            if (player !== undefined) {
                playerVisible._playerCount -= 1;
                if (player.nightVision)
                    playerVisible._playerNightVisionCount -= 1;
                continue;
            }
            let light = this.world.getComponent(e, _lightSystem__WEBPACK_IMPORTED_MODULE_6__.LIGHT_TYPE);
            if (light !== undefined) {
                playerVisible._lightCount -= 1;
            }
        }
        this.onPlayerVisibleCountersUpdate(playerVisible);
    }
    onNightVisionUpdate(player) {
        let vis = this.world.getComponent(player.entity, _visibilitySystem__WEBPACK_IMPORTED_MODULE_2__.VISIBILITY_TYPE);
        let diff = player.nightVision ? +1 : -1;
        let fun = (t) => {
            let playerVisible = this.visibleStorage.getComponent(t);
            if (playerVisible === undefined)
                return;
            playerVisible._playerNightVisionCount += diff;
            this.onPlayerVisibleCountersUpdate(playerVisible);
        };
        for (let t of vis._canSee)
            fun(t);
        if (vis._canSeeWalls)
            for (let t of vis._canSeeWalls)
                fun(t);
    }
    createVisMeshFrom(pos, vis) {
        let mesh = _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_3__.createMesh('const');
        _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_3__.updateMeshPolygons(mesh, pos, vis.polygon);
        let r = vis.range * this.gridSize;
        _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_3__.updateMeshUniforms(mesh, pos, r * r, 0xFFFFFF);
        return mesh;
    }
    spreadPlayerVisibility(player, pos, vis, nightVision) {
        if (this.world.getComponent(player, _component__WEBPACK_IMPORTED_MODULE_1__.HOST_HIDDEN_TYPE))
            return; // Ignore hidden players
        let playerVis = _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_3__.createMesh('const');
        _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_3__.updateMeshPolygons(playerVis, pos, vis.polygon);
        let r = vis.range * this.gridSize;
        _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_3__.updateMeshUniforms(playerVis, pos, r * r, 0xFFFFFF);
        let lightStorage = this.world.storages.get(_lightSystem__WEBPACK_IMPORTED_MODULE_6__.LIGHT_TYPE);
        let posStorage = this.world.storages.get(_component__WEBPACK_IMPORTED_MODULE_1__.POSITION_TYPE);
        let playerData = {
            mesh: playerVis,
            vis,
            pos,
        };
        let players = [];
        let nightVisPlayers = [];
        let lights = [];
        let aabb;
        if (!nightVision && !this.ambientIlluminated) {
            players.push(playerData);
            aabb = undefined;
            for (let c of this.visibilitySystem.aabbTree.query(vis.aabb)) {
                let visComponent = c.tag;
                let lightComponent = lightStorage.getComponent(visComponent.entity);
                if (lightComponent === undefined || visComponent.range <= 0)
                    continue;
                let pos = posStorage.getComponent(visComponent.entity);
                if (aabb === undefined)
                    aabb = visComponent.aabb.copy();
                else
                    aabb.combine(visComponent.aabb, aabb);
                let mesh = this.createVisMeshFrom(pos, visComponent);
                lights.push({
                    mesh,
                    pos,
                    vis: visComponent,
                });
            }
            if (lights.length === 0)
                return; // no night vision AND no lights = can't see a thing!
            aabb.intersect(vis.aabb, aabb);
        }
        else {
            nightVisPlayers.push(playerData);
            aabb = vis.aabb;
        }
        let data = {
            aabb,
            lights,
            players,
            nightVisPlayers,
        };
        this.world.events.emit(EVENT_VISIBILITY_SPREAD, data);
        playerData.mesh.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_4__.DESTROY_ALL);
        for (let light of data.lights)
            light.mesh.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_4__.DESTROY_ALL);
    }
    spreadLightVisibility(lightVis) {
        // Quite similar to spreadPlayerVisibility but follows a light instead of a player,
        // When a light visibility polygon is changed this will query each player in the polygon's reach and
        // spread the visibility (only with that light!)
        if (this.ambientIlluminated)
            return; // Who needs lights?
        let visStorage = this.world.storages.get(_visibilitySystem__WEBPACK_IMPORTED_MODULE_2__.VISIBILITY_TYPE);
        let posStorage = this.world.storages.get(_component__WEBPACK_IMPORTED_MODULE_1__.POSITION_TYPE);
        let lightPos = posStorage.getComponent(lightVis.entity);
        let lightMesh = this.createVisMeshFrom(lightPos, lightVis);
        let lightData = [{
                mesh: lightMesh,
                pos: lightPos,
                vis: lightVis,
            }];
        let aabb = undefined;
        let players = [];
        for (let c of this.visibilitySystem.aabbTree.query(lightVis.aabb)) {
            let visComponent = c.tag;
            let player = this.storage.getComponent(visComponent.entity);
            if (player === undefined || visComponent.range <= 0 || player.nightVision)
                continue;
            if (aabb === undefined)
                aabb = visComponent.aabb.copy();
            else
                aabb.combine(visComponent.aabb, aabb);
            let vis = visStorage.getComponent(player.entity);
            let pos = posStorage.getComponent(player.entity);
            let mesh = this.createVisMeshFrom(pos, vis);
            players.push({
                mesh,
                pos,
                vis,
            });
        }
        if (players.length === 0)
            return;
        aabb.intersect(lightVis.aabb, aabb);
        let data = {
            aabb,
            lights: lightData,
            players,
            nightVisPlayers: [],
            nightVision: false,
        };
        this.world.events.emit(EVENT_VISIBILITY_SPREAD, data);
        lightData[0].mesh.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_4__.DESTROY_ALL);
        for (let player of players)
            player.mesh.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_4__.DESTROY_ALL);
    }
    spreadAfterLightNotNeeded() {
        // Something changed, light is not needed anymore
        // this means that most of the things that were not visible anymore now are
        // but what? and where? this is the questions i will answer today
        let players = [];
        let visStorage = this.world.storages.get(_visibilitySystem__WEBPACK_IMPORTED_MODULE_2__.VISIBILITY_TYPE);
        let posStorage = this.world.storages.get(_component__WEBPACK_IMPORTED_MODULE_1__.POSITION_TYPE);
        let aabb = undefined;
        for (let player of this.storage.allComponents()) {
            if (player.nightVision)
                continue;
            let vis = visStorage.getComponent(player.entity);
            let pos = posStorage.getComponent(vis.entity);
            let mesh = this.createVisMeshFrom(pos, vis);
            if (aabb === undefined)
                aabb = vis.aabb.copy();
            else
                aabb.combine(vis.aabb, aabb);
            let data = { mesh, pos, vis };
            players.push(data);
        }
        if (aabb === undefined)
            return; // Not enough players
        let data = {
            aabb,
            lights: [],
            players: [],
            nightVisPlayers: players,
            nightVision: false,
        };
        this.world.events.emit(EVENT_VISIBILITY_SPREAD, data);
        for (let x of players)
            x.mesh.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_4__.DESTROY_ALL);
    }
    getSpreadDataForAabb(aabb, cb) {
        let nightVisPlayers = [];
        let players = [];
        let lights = [];
        let lightsNeeded = !this.ambientIlluminated;
        let lightStorage = this.world.storages.get(_lightSystem__WEBPACK_IMPORTED_MODULE_6__.LIGHT_TYPE);
        let posStorage = this.world.storages.get(_component__WEBPACK_IMPORTED_MODULE_1__.POSITION_TYPE);
        for (let c of this.visibilitySystem.aabbTree.query(aabb)) {
            let vis = c.tag;
            let player = this.storage.getComponent(vis.entity);
            if (player !== undefined) {
                let pos = posStorage.getComponent(vis.entity);
                let mesh = this.createVisMeshFrom(pos, vis);
                let data = { mesh, pos, vis };
                if (player.nightVision || !lightsNeeded)
                    nightVisPlayers.push(data);
                else
                    players.push(data);
                continue;
            }
            if (lightsNeeded) {
                let light = lightStorage.getComponent(vis.entity);
                if (light !== undefined) {
                    let pos = posStorage.getComponent(vis.entity);
                    let mesh = this.createVisMeshFrom(pos, vis);
                    let data = { mesh, pos, vis };
                    lights.push(data);
                }
            }
        }
        let realPlayers = players;
        let realLights = lights;
        if (players.length === 0 || lights.length == 0) {
            realPlayers = [];
            realLights = [];
        }
        let data = {
            aabb,
            lights: realLights,
            players: realPlayers,
            nightVisPlayers,
        };
        cb(data);
        for (let x of lights)
            x.mesh.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_4__.DESTROY_ALL);
        for (let x of players)
            x.mesh.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_4__.DESTROY_ALL);
        for (let x of nightVisPlayers)
            x.mesh.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_4__.DESTROY_ALL);
    }
    onComponentAdd(comp) {
        if (comp.type === PLAYER_TYPE) {
            let player = comp;
            let pv = this.visibleStorage.getComponent(comp.entity);
            if (pv === undefined) {
                console.error("Added player to pin without player visibility! " + comp.entity);
                return;
            }
            pv._playerNightVisionCount++; // A bit hackish, but it works ;)
            this.onPlayerVisibleCountersUpdate(pv);
            // We need a visibility component, create one if it does not already exist
            let vis = {
                type: _visibilitySystem__WEBPACK_IMPORTED_MODULE_2__.VISIBILITY_TYPE,
                range: player.range,
                trackWalls: true,
            };
            this.world.addComponent(comp.entity, vis);
        }
        else if (comp.type === PLAYER_VISIBLE_TYPE) {
            let c = comp;
            c._lightCount = 0;
            c._playerCount = 0;
            c._playerNightVisionCount = 0;
            this.world.addComponent(c.entity, (0,_visibilityAwareSystem__WEBPACK_IMPORTED_MODULE_5__.newVisibilityAwareComponent)(c.isWall === true));
        }
    }
    onComponentEdited(comp, changed) {
        if (comp.type === PLAYER_TYPE) {
            let c = comp;
            if ('nightVision' in changed) {
                this.onNightVisionUpdate(c);
            }
            if ('range' in changed) {
                this.world.editComponent(c.entity, _visibilitySystem__WEBPACK_IMPORTED_MODULE_2__.VISIBILITY_TYPE, {
                    range: c.range
                });
            }
            else {
                let vis = this.world.getComponent(c.entity, _visibilitySystem__WEBPACK_IMPORTED_MODULE_2__.VISIBILITY_TYPE);
                if (vis.polygon !== undefined) {
                    let pos = this.world.getComponent(comp.entity, _component__WEBPACK_IMPORTED_MODULE_1__.POSITION_TYPE);
                    this.spreadPlayerVisibility(comp.entity, pos, vis, c.nightVision);
                }
            }
        }
        else if (comp.type === _visibilitySystem__WEBPACK_IMPORTED_MODULE_2__.VISIBILITY_TYPE) {
            let vis = comp;
            if (!('polygon' in changed))
                return;
            let player = this.storage.getComponent(vis.entity);
            if (player !== undefined) {
                if (vis.polygon !== undefined) {
                    let pos = this.world.getComponent(comp.entity, _component__WEBPACK_IMPORTED_MODULE_1__.POSITION_TYPE);
                    this.spreadPlayerVisibility(comp.entity, pos, vis, player.nightVision);
                }
                return;
            }
            let light = this.world.getComponent(vis.entity, _lightSystem__WEBPACK_IMPORTED_MODULE_6__.LIGHT_TYPE);
            if (light !== undefined) {
                this.spreadLightVisibility(vis);
            }
        }
    }
    onComponentRemove(comp) {
        if (comp.type === PLAYER_TYPE) {
            let vis = this.world.getComponent(comp.entity, _visibilitySystem__WEBPACK_IMPORTED_MODULE_2__.VISIBILITY_TYPE);
            if (vis !== undefined) {
                this.world.removeComponent(vis);
            }
            else {
                console.warn("No player visibility found on removal");
            }
            let pv = this.visibleStorage.getComponent(comp.entity);
            if (pv === undefined)
                return;
            pv._playerNightVisionCount--; // Gotta undo those hacks
            this.onPlayerVisibleCountersUpdate(pv);
        }
    }
    onResourceEdited(res, changed) {
        if (res.type === _lightSystem__WEBPACK_IMPORTED_MODULE_6__.LIGHT_SETTINGS_TYPE && 'needsLight' in changed) {
            let light = res;
            this.ambientIlluminated = !light.needsLight;
            for (let comp of this.visibleStorage.allComponents()) {
                this.onPlayerVisibleCountersUpdate(comp);
            }
            if (!light.needsLight) {
                this.spreadAfterLightNotNeeded();
            }
        }
        else if (res.type === _gridSystem__WEBPACK_IMPORTED_MODULE_8__.GRID_TYPE && 'size' in changed) {
            let grid = res;
            this.gridSize = grid.size;
        }
    }
    // PUBLIC INTERFACE
    addPlayerVisListener(entity, isWall = false) {
        let c = this.visibleStorage.getComponent(entity);
        if (c === undefined) {
            c = {
                type: PLAYER_VISIBLE_TYPE,
                entity,
                visible: false,
                isWall,
                _refCount: 1,
                _lightCount: 0,
                _playerCount: 0,
                _playerNightVisionCount: 0,
            };
            this.world.addComponent(entity, c);
            return c;
        }
        else {
            c._refCount++;
        }
        return c;
    }
    removePlayerVisListener(entity) {
        let c = this.visibleStorage.getComponent(entity);
        if (c === undefined)
            return;
        c._refCount--;
        if (c._refCount === 0) {
            this.world.removeComponent(c);
        }
    }
    enable() {
        _game_pointLightRenderer__WEBPACK_IMPORTED_MODULE_3__.setup();
    }
    destroy() {
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/propSystem.ts":
/*!*******************************************!*\
  !*** ./src/app/ecs/systems/propSystem.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PROP_TYPE": () => (/* binding */ PROP_TYPE),
/* harmony export */   "PROP_TELEPORT_TYPE": () => (/* binding */ PROP_TELEPORT_TYPE),
/* harmony export */   "PropSystem": () => (/* binding */ PropSystem),
/* harmony export */   "CreatePropToolDriver": () => (/* binding */ CreatePropToolDriver),
/* harmony export */   "PropTeleportLinkToolDriver": () => (/* binding */ PropTeleportLinkToolDriver)
/* harmony export */ });
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../phase/editMap/displayPrecedence */ "./src/app/phase/editMap/displayPrecedence.ts");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../storage */ "./src/app/ecs/storage.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../component */ "./src/app/ecs/component.ts");
/* harmony import */ var _interactionSystem__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./interactionSystem */ "./src/app/ecs/systems/interactionSystem.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../graphics */ "./src/app/graphics.ts");
/* harmony import */ var _toolSystem__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./toolSystem */ "./src/app/ecs/systems/toolSystem.ts");
/* harmony import */ var _tools_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../tools/utils */ "./src/app/ecs/tools/utils.ts");
/* harmony import */ var _selectionSystem__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./selectionSystem */ "./src/app/ecs/systems/selectionSystem.ts");
/* harmony import */ var _tools_toolType__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../tools/toolType */ "./src/app/ecs/tools/toolType.ts");
/* harmony import */ var _command_command__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./command/command */ "./src/app/ecs/systems/command/command.ts");
/* harmony import */ var _command_componentEdit__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./command/componentEdit */ "./src/app/ecs/systems/command/componentEdit.ts");












const PROP_TYPE = 'prop';
const PROP_TELEPORT_TYPE = 'prop_teleport';
class PropSystem {
    constructor(world) {
        this.name = PROP_TYPE;
        this.dependencies = [_graphics__WEBPACK_IMPORTED_MODULE_5__.GRAPHIC_TYPE, _interactionSystem__WEBPACK_IMPORTED_MODULE_4__.INTERACTION_TYPE, _selectionSystem__WEBPACK_IMPORTED_MODULE_8__.SELECTION_TYPE];
        this.storage = new _storage__WEBPACK_IMPORTED_MODULE_2__.SingleEcsStorage(PROP_TYPE, true, true);
        this.teleportStorage = new _storage__WEBPACK_IMPORTED_MODULE_2__.SingleEcsStorage(PROP_TELEPORT_TYPE, true, true);
        this.defaultPropType = "ladder_down";
        this.world = world;
        if (world.isMaster) {
            const toolSys = world.systems.get(_toolSystem__WEBPACK_IMPORTED_MODULE_6__.TOOL_TYPE);
            toolSys.addTool(new CreatePropToolDriver(this));
            toolSys.addTool(new PropTeleportLinkToolDriver(this));
        }
        this.interactionSys = world.systems.get(_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.INTERACTION_TYPE);
        this.selectionSys = world.systems.get(_selectionSystem__WEBPACK_IMPORTED_MODULE_8__.SELECTION_TYPE);
        this.propTypes = new Map();
        this.loadPropTypes();
        world.addStorage(this.storage);
        world.addStorage(this.teleportStorage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('prop_use', this.onPropUse, this);
    }
    registerPropType(propType) {
        this.propTypes.set(propType.id, propType);
    }
    loadPropTypes() {
        const atlas = _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Loader.shared.resources.props.spritesheet;
        const props = [
            {
                id: 'ladder_up',
                name: 'Ladder Up',
                texture: atlas.textures['ladder_up.png'],
            },
            {
                id: 'ladder_down',
                name: 'Ladder Down',
                texture: atlas.textures['ladder_down.png'],
            },
        ];
        for (let prop of props)
            this.registerPropType(prop);
    }
    getPropType(p) {
        let pType = this.propTypes.get(p.propType);
        if (pType === undefined) {
            console.warn(`Cannot find prop type: ${p.propType}`);
            pType = this.propTypes.get(this.defaultPropType);
            if (pType === undefined) {
                throw "Default prop type is invalid!";
            }
        }
        return pType;
    }
    onComponentAdd(c) {
        if (c.type !== 'prop')
            return;
        let prop = c;
        let propType = this.getPropType(prop);
        this.world.addComponent(c.entity, {
            type: _graphics__WEBPACK_IMPORTED_MODULE_5__.GRAPHIC_TYPE,
            entity: -1,
            interactive: true,
            display: {
                type: _graphics__WEBPACK_IMPORTED_MODULE_5__.ElementType.IMAGE,
                ignore: false,
                priority: _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_1__.DisplayPrecedence.PROP,
                scale: _graphics__WEBPACK_IMPORTED_MODULE_5__.ImageScaleMode.GRID,
                visib: _graphics__WEBPACK_IMPORTED_MODULE_5__.VisibilityType.REMEMBER,
                texture: propType.texture,
                sharedTexture: true,
                anchor: { x: 0.5, y: 0.5 },
                tint: 0xFFFFFF,
            },
        });
    }
    onComponentEdited(c, changed) {
        if (c.type === PROP_TYPE) {
            let prop = c;
            let pType = this.getPropType(prop);
            let display = this.world.getComponent(c.entity, _graphics__WEBPACK_IMPORTED_MODULE_5__.GRAPHIC_TYPE).display;
            display.texture = pType.texture;
            this.world.editComponent(c.entity, _graphics__WEBPACK_IMPORTED_MODULE_5__.GRAPHIC_TYPE, { display }, undefined, false);
        }
    }
    onComponentRemove(c) {
        if (c.type === 'prop') {
            let tp = this.teleportStorage.getComponent(c.entity);
            if (tp !== undefined)
                this.world.removeComponent(tp);
        }
    }
    onPropUse(entity) {
        let prop = this.storage.getComponent(entity);
        let teleport = this.teleportStorage.getComponent(entity);
        if (prop === undefined || teleport === undefined)
            return;
        let target = this.storage.getComponent(teleport.entity);
        if (target === undefined) {
            console.warn("Unlinked teleporter!");
            return;
        }
        let positions = this.world.storages.get(_component__WEBPACK_IMPORTED_MODULE_3__.POSITION_TYPE);
        let posFrom = positions.getComponent(entity);
        let posTo = positions.getComponent(teleport.targetProp);
        let diffX = posTo.x - posFrom.x;
        let diffY = posTo.y - posFrom.y;
        let shape = this.world.getComponent(entity, _interactionSystem__WEBPACK_IMPORTED_MODULE_4__.INTERACTION_TYPE).shape;
        let pinStorage = this.world.storages.get('pin');
        let query = this.interactionSys.query(shape, x => {
            return pinStorage.getComponent(x.entity) !== undefined;
        });
        for (let q of query) {
            let pos = positions.getComponent(q.entity);
            this.world.editComponent(q.entity, pos.type, {
                x: pos.x + diffX,
                y: pos.y + diffY,
            });
        }
    }
    enable() {
    }
    destroy() {
    }
}
class CreatePropToolDriver {
    constructor(sys) {
        this.name = _tools_toolType__WEBPACK_IMPORTED_MODULE_9__.Tool.CREATE_PROP;
        // Entity of the prop to be created
        this.createProp = -1;
        this.sys = sys;
    }
    createFrozenProp(propType, prepend) {
        return {
            id: this.sys.world.allocateId(),
            components: [
                ...prepend,
                {
                    type: _component__WEBPACK_IMPORTED_MODULE_3__.TRANSFORM_TYPE,
                    rotation: 0,
                    scale: 1,
                },
                {
                    type: _graphics__WEBPACK_IMPORTED_MODULE_5__.GRAPHIC_TYPE,
                    entity: -1,
                    interactive: false,
                    display: {
                        type: _graphics__WEBPACK_IMPORTED_MODULE_5__.ElementType.IMAGE,
                        ignore: false,
                        priority: _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_1__.DisplayPrecedence.PROP,
                        scale: _graphics__WEBPACK_IMPORTED_MODULE_5__.ImageScaleMode.GRID,
                        visib: _graphics__WEBPACK_IMPORTED_MODULE_5__.VisibilityType.ALWAYS_VISIBLE,
                        texture: propType.texture,
                        sharedTexture: true,
                        anchor: { x: 0.5, y: 0.5 },
                        tint: 0xFFFFFF,
                    },
                }
            ]
        };
    }
    initCreation() {
        this.cancelCreation();
        this.createPropType = this.sys.defaultPropType;
        let propType = this.sys.propTypes.get(this.createPropType);
        if (propType === undefined)
            throw 'Illegal prop type: ' + this.createPropType;
        this.createProp = this.sys.world.spawnEntity({
            type: _component__WEBPACK_IMPORTED_MODULE_3__.HOST_HIDDEN_TYPE,
        }, {
            type: _component__WEBPACK_IMPORTED_MODULE_3__.POSITION_TYPE,
            x: Number.NEGATIVE_INFINITY,
            y: Number.NEGATIVE_INFINITY,
        }, {
            type: _component__WEBPACK_IMPORTED_MODULE_3__.TRANSFORM_TYPE,
            rotation: 0,
            scale: 1,
        }, {
            type: _graphics__WEBPACK_IMPORTED_MODULE_5__.GRAPHIC_TYPE,
            entity: -1,
            interactive: false,
            display: {
                type: _graphics__WEBPACK_IMPORTED_MODULE_5__.ElementType.IMAGE,
                ignore: false,
                priority: _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_1__.DisplayPrecedence.PROP,
                scale: _graphics__WEBPACK_IMPORTED_MODULE_5__.ImageScaleMode.GRID,
                visib: _graphics__WEBPACK_IMPORTED_MODULE_5__.VisibilityType.ALWAYS_VISIBLE,
                texture: propType.texture,
                sharedTexture: true,
                anchor: { x: 0.5, y: 0.5 },
                tint: 0xFFFFFF,
            },
        }, {
            type: _component__WEBPACK_IMPORTED_MODULE_3__.FOLLOW_MOUSE_TYPE,
        });
    }
    cancelCreation() {
        if (this.createProp !== -1) {
            this.sys.world.despawnEntity(this.createProp);
            this.createProp = -1;
        }
    }
    confirmCreation() {
        if (this.createProp === undefined)
            return;
        const id = this.createProp;
        const world = this.sys.world;
        let loc = world.getComponent(id, _component__WEBPACK_IMPORTED_MODULE_3__.POSITION_TYPE);
        let tran = world.getComponent(id, _component__WEBPACK_IMPORTED_MODULE_3__.TRANSFORM_TYPE);
        world.despawnEntity(id);
        this.createProp = -1;
        let frozenEntity = {
            id: world.allocateId(),
            components: [
                {
                    type: _component__WEBPACK_IMPORTED_MODULE_3__.POSITION_TYPE,
                    x: loc.x,
                    y: loc.y,
                },
                {
                    type: _component__WEBPACK_IMPORTED_MODULE_3__.TRANSFORM_TYPE,
                    scale: tran.scale,
                    rotation: tran.rotation,
                },
                {
                    type: PROP_TYPE,
                    propType: this.createPropType,
                },
            ]
        };
        let cmd = {
            kind: 'spawn',
            entities: [frozenEntity]
        };
        this.sys.world.editResource(_toolSystem__WEBPACK_IMPORTED_MODULE_6__.TOOL_TYPE, {
            tool: _tools_toolType__WEBPACK_IMPORTED_MODULE_9__.Tool.INSPECT,
        });
        (0,_command_command__WEBPACK_IMPORTED_MODULE_10__.executeAndLogCommand)(world, cmd);
    }
    onStart() {
        this.initCreation();
    }
    onEnd() {
        this.cancelCreation();
    }
    onPointerClick(event) {
        this.confirmCreation();
    }
}
class PropTeleportLinkToolDriver {
    constructor(sys) {
        this.name = _tools_toolType__WEBPACK_IMPORTED_MODULE_9__.Tool.PROP_TELEPORT_LINK;
        this.currentTarget = -1;
        this.sys = sys;
    }
    initialize() {
        this.sys.world.events.on('prop_teleport_link', this.onPropTeleportLink, this);
    }
    destroy() {
        this.sys.world.events.off('prop_teleport_link', this.onPropTeleportLink, this);
    }
    onPropTeleportLink(entity) {
        let tp = this.sys.teleportStorage.getComponent(entity);
        if (tp === undefined) {
            console.warn("Called teleport link on a non-teleport prop, ignoring");
            return;
        }
        this.currentTarget = entity;
        this.sys.world.editResource(_toolSystem__WEBPACK_IMPORTED_MODULE_6__.TOOL_TYPE, {
            tool: _tools_toolType__WEBPACK_IMPORTED_MODULE_9__.Tool.PROP_TELEPORT_LINK,
        });
    }
    linkTo(target) {
        if (this.sys.storage.getComponent(target) === undefined) {
            console.warn("Trying to link teleport to a non-prop, ignoring");
            return;
        }
        let tper = this.sys.teleportStorage.getComponent(this.currentTarget);
        if (tper === undefined) {
            console.warn("Teleporter has been destroyed");
            return;
        }
        // If the target is itself then delete the link
        let cmd = (0,_command_componentEdit__WEBPACK_IMPORTED_MODULE_11__.componentEditCommand)();
        cmd.edit.push({
            entity: tper.entity,
            type: tper.type,
            changes: {
                targetProp: target === this.currentTarget ? -1 : target
            }
        });
        (0,_command_command__WEBPACK_IMPORTED_MODULE_10__.executeAndLogCommand)(this.sys.world, cmd);
        this.currentTarget = -1;
    }
    linkCancel() {
        this.currentTarget = -1;
    }
    onStart() {
        document.body.style.cursor = 'crosshair';
    }
    onEnd() {
        this.linkCancel();
        document.body.style.cursor = 'auto';
    }
    onPointerClick(event) {
        let point = (0,_tools_utils__WEBPACK_IMPORTED_MODULE_7__.getMapPointFromMouseInteraction)(this.sys.world, event);
        let interactionSystem = this.sys.world.systems.get(_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.INTERACTION_TYPE);
        let query = interactionSystem.query((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapePoint)(point), x => {
            return this.sys.world.getComponent(x.entity, 'prop') !== undefined;
        });
        for (let found of query) {
            let oldTper = this.currentTarget;
            this.linkTo(found.entity);
            this.sys.selectionSys.setOnlyEntity(oldTper);
            this.sys.world.editResource(_toolSystem__WEBPACK_IMPORTED_MODULE_6__.TOOL_TYPE, {
                tool: _tools_toolType__WEBPACK_IMPORTED_MODULE_9__.Tool.INSPECT,
            });
            return;
        }
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/selectionSystem.ts":
/*!************************************************!*\
  !*** ./src/app/ecs/systems/selectionSystem.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SELECTION_TYPE": () => (/* binding */ SELECTION_TYPE),
/* harmony export */   "SelectionSystem": () => (/* binding */ SelectionSystem)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./src/app/ecs/component.ts");
/* harmony import */ var _doorSystem__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./doorSystem */ "./src/app/ecs/systems/doorSystem.ts");
/* harmony import */ var _propSystem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./propSystem */ "./src/app/ecs/systems/propSystem.ts");
/* harmony import */ var _command_componentEdit__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./command/componentEdit */ "./src/app/ecs/systems/command/componentEdit.ts");
/* harmony import */ var _command_commandSystem__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./command/commandSystem */ "./src/app/ecs/systems/command/commandSystem.ts");





const MULTI_TYPES = ['name', 'note'];
const ELIMINABLE_TYPES = ['name', 'note', 'player', 'light', 'door'];
const FULLSCREENABLE_TYPES = ['note'];
const SELECTION_TYPE = 'selection';
class SelectionSystem {
    constructor(ecs) {
        this.name = SELECTION_TYPE;
        this.dependencies = [];
        this.selectedEntities = new Set();
        this.dataByType = new Map();
        this.isTranslating = false;
        this.translateDirty = false;
        this.ecs = ecs;
        this.ecs.events.on('tool_move_begin', () => this.isTranslating = true);
        this.ecs.events.on('tool_move_end', () => {
            this.isTranslating = false;
            if (this.translateDirty) {
                this.translateDirty = false;
                this.ecs.events.emit(_command_commandSystem__WEBPACK_IMPORTED_MODULE_4__.EVENT_COMMAND_PARTIAL_END);
                this.update();
            }
        });
        this.ecs.events.on('component_add', this.onComponentAdd, this);
        this.ecs.events.on('component_edited', this.onComponentUpdate, this);
        this.ecs.events.on('component_removed', this.onComponentRemove, this);
        this.ecs.events.on('entity_despawn', this.onEntityDespawn, this);
        if (ecs.isMaster) {
            this.ecs.events.on('command_post_execute', (c) => {
                // a spawn command has been executed
                if (c === undefined || c.kind !== 'despawn')
                    return;
                this.setOnlyEntities(c.entities);
            });
        }
        this.ecs.events.on('entity_despawn', this.onEntityDespawn, this);
    }
    logSelectionTypes() {
        console.log("--- SELECTION ---");
        for (let entity of this.selectedEntities) {
            let comps = this.ecs.getAllComponents(entity);
            console.log(entity + ": " + comps.map(x => x.type).join(', '));
        }
    }
    update() {
        if (this.isTranslating)
            this.translateDirty = true;
        else
            this.ecs.events.emit('selection_update', this);
    }
    onComponentAdd(component) {
        if (!this.selectedEntities.has(component.entity))
            return;
        this.getOrCreateData(component.type).entities.add(component);
        this.update();
    }
    onComponentUpdate(component) {
        if (this.selectedEntities.has(component.entity))
            this.update();
    }
    onComponentRemove(component) {
        if (!this.selectedEntities.has(component.entity))
            return;
        let data = this.dataByType.get(component.type);
        data.entities.delete(component);
        if (data.entities.size === 0)
            this.dataByType.delete(component.type);
        this.update();
    }
    onEntityDespawn(entity) {
        if (!this.selectedEntities.has(entity))
            return;
        this.removeEntities([entity]);
    }
    clear(callListeners = true, update = true) {
        if (callListeners) {
            for (let id of this.selectedEntities) {
                this.ecs.events.emit('selection_end', id);
            }
        }
        this.selectedEntities.clear();
        this.dataByType.clear();
        if (update) {
            this.update();
        }
    }
    setOnlyEntity(id) {
        this.clear(true, false);
        this.addEntities([id]);
    }
    setOnlyEntities(ids) {
        let idSet = new Set(ids);
        let removeIds = new Array();
        for (let id of this.selectedEntities) {
            if (!idSet.has(id))
                removeIds.push(id);
        }
        this.removeEntities(removeIds, false);
        this.addEntities(ids, false);
        this.update();
    }
    toggleEntities(ids, update = true) {
        for (let id of ids) {
            if (this.selectedEntities.has(id)) {
                this.removeEntities([id], false);
            }
            else {
                this.addEntities([id], false);
            }
        }
        if (update)
            this.update();
    }
    addEntities(ids, update = true) {
        let count = 0;
        for (let id of ids) {
            if (this.selectedEntities.has(id))
                continue;
            count++;
            this.selectedEntities.add(id);
            let comps = this.ecs.getAllComponents(id);
            for (let c of comps) {
                this.getOrCreateData(c.type).entities.add(c);
            }
            this.ecs.events.emit('selection_begin', id);
        }
        if (update && count !== 0)
            this.update();
    }
    removeEntities(ids, update = true) {
        let count = 0;
        for (let id of ids) {
            if (!this.selectedEntities.has(id))
                continue;
            count++;
            this.selectedEntities.delete(id);
            let comps = this.ecs.getAllComponents(id);
            for (let c of comps) {
                let data = this.dataByType.get(c.type);
                data.entities.delete(c);
                if (data.entities.size === 0)
                    this.dataByType.delete(c.type);
            }
            this.ecs.events.emit('selection_end', id);
        }
        if (update && count !== 0)
            this.update();
    }
    getSelectedByType(type) {
        let data = this.dataByType.get(type);
        if (data === undefined)
            return [];
        return data.entities;
    }
    initialComponent(type) {
        let storage = this.ecs.storages.get(type);
        return {
            _canDelete: ELIMINABLE_TYPES.indexOf(type) >= 0,
            _isFullscreen: FULLSCREENABLE_TYPES.indexOf(type) >= 0 ? false : undefined,
            _sync: storage.sync,
            _save: storage.save,
        };
    }
    getSingleComponents() {
        let res = new Array();
        let entity = this.selectedEntities.values().next().value;
        for (let [type, storage] of this.ecs.storages.entries()) {
            if (type.startsWith('host_'))
                continue;
            let comps = storage.getComponents(entity);
            for (let comp of comps) {
                res.push(removePrivate(this.initialComponent(type), comp));
            }
        }
        return res;
    }
    getCommonComponents() {
        if (this.selectedEntities.size === 0)
            return [];
        let selCount = this.selectedEntities.size;
        if (selCount === 1)
            return this.getSingleComponents();
        let commonTypes = new Array();
        for (let type of this.ecs.storages.keys()) {
            if (type === 'host_hidden')
                continue;
            let data = this.dataByType.get(type);
            if (data != undefined && data.entities.size === selCount && MULTI_TYPES.indexOf(type) === -1) {
                commonTypes.push(type);
            }
        }
        let res = new Array();
        for (let type of commonTypes) {
            if (type === 'host_hidden')
                continue;
            let component = undefined;
            for (let entity of this.selectedEntities) {
                let comps = this.ecs.storages.get(type).getComponents(entity);
                for (let comp of comps) {
                    if (component === undefined) {
                        component = removePrivate(this.initialComponent(type), comp); // copy
                    }
                    else {
                        biFilterObj(component, comp);
                    }
                }
            }
            res.push(component);
        }
        return res;
    }
    getCommonEntityOpts() {
        let hostHidden = this.dataByType.get('host_hidden');
        return {
            hidden: hostHidden !== undefined && hostHidden.entities.size === this.selectedEntities.size,
            ids: Array.from(this.selectedEntities),
        };
    }
    getAddableComponents() {
        let res = new Array();
        res.push({
            type: 'name',
            name: 'Name'
        }, {
            type: 'note',
            name: 'Note'
        });
        if (this.hasEveryoneType('pin') && !(this.hasComponentType('light') || this.hasComponentType('player'))) {
            res.push({
                type: 'light',
                name: 'Light'
            }, {
                type: 'player',
                name: 'Player',
            });
        }
        else if (this.hasEveryoneType('wall') && !this.hasComponentType('door')) {
            res.push({
                type: "door",
                name: "Door"
            });
        }
        else if (this.hasEveryoneType('prop') && !this.hasComponentType('prop_teleport')) {
            res.push({
                type: 'prop_teleport',
                name: "Teleporter",
            });
        }
        return res;
    }
    setProperty(type, propertyName, propertyValue, multiId) {
        if (type === '$') {
            // Special management
            switch (propertyName) {
                case 'hidden': {
                    let add = [];
                    let remove = [];
                    for (let entity of this.selectedEntities) {
                        let cmp = this.ecs.getComponent(entity, _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE);
                        if (cmp !== undefined) {
                            remove.push({
                                type: _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE,
                                entity: entity,
                            });
                            this.ecs.removeComponent(cmp);
                        }
                        else {
                            add.push({
                                type: _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE,
                                entity: entity,
                            });
                        }
                    }
                    let cmd = {
                        kind: "cedit",
                        add, remove,
                        edit: [],
                    };
                    this.ecs.events.emit("command_log", cmd);
                    break;
                }
                case 'delete': {
                    let cmd = {
                        kind: 'despawn',
                        entities: [...this.selectedEntities],
                    };
                    this.clear();
                    this.ecs.events.emit("command_log", cmd);
                    break;
                }
                case 'addComponent': {
                    let comp;
                    switch (propertyValue) {
                        case 'name':
                            comp = {
                                type: _component__WEBPACK_IMPORTED_MODULE_0__.NAME_TYPE,
                                name: '',
                                clientVisible: true,
                            };
                            break;
                        case 'note':
                            comp = {
                                type: _component__WEBPACK_IMPORTED_MODULE_0__.NOTE_TYPE,
                                note: '',
                                clientVisible: true,
                            };
                            break;
                        case 'light':
                            comp = {
                                type: 'light',
                                color: 0xFFFFFF,
                                range: 2,
                            };
                            break;
                        case 'player':
                            comp = {
                                type: 'player',
                                nightVision: false,
                                range: 50,
                            };
                            break;
                        case 'door':
                            comp = {
                                type: 'door',
                                doorType: _doorSystem__WEBPACK_IMPORTED_MODULE_1__.DoorType.NORMAL_LEFT,
                                locked: false,
                                open: false,
                                clientVisible: true,
                            };
                            break;
                        case 'prop_teleport':
                            comp = {
                                type: _propSystem__WEBPACK_IMPORTED_MODULE_2__.PROP_TELEPORT_TYPE,
                                entity: -1,
                                targetProp: -1,
                            };
                            break;
                        default:
                            throw 'Cannot add unknown component: ' + propertyValue;
                    }
                    let cmd = (0,_command_componentEdit__WEBPACK_IMPORTED_MODULE_3__.componentEditCommand)();
                    for (let entity of [...this.selectedEntities]) {
                        cmd.add.push(Object.assign({ entity }, comp));
                    }
                    this.ecs.events.emit("command_log", cmd);
                    break;
                }
                case 'removeComponent':
                    let cmd = (0,_command_componentEdit__WEBPACK_IMPORTED_MODULE_3__.componentEditCommand)();
                    for (let entity of [...this.selectedEntities]) {
                        let comp = this.ecs.getComponent(entity, propertyValue, multiId);
                        if (comp === undefined)
                            continue;
                        cmd.remove.push({
                            type: comp.type,
                            entity: comp.entity,
                            multiId: multiId,
                        });
                    }
                    this.ecs.events.emit("command_log", cmd);
                    break;
                default:
                    console.warn("Unknown special event: " + propertyName);
            }
            return;
        }
        else if (type === '@') {
            // Event call (yeah I know this is ugly) TODO please next me clean it up
            // TODO: command log
            this.ecs.events.emit(propertyName, propertyValue, multiId);
            return;
        }
        if (!this.hasEveryoneType(type)) {
            this.logSelectionTypes();
            console.error("Trying to change type of selection when not everyone has that type: " + type);
        }
        let oldEntities = Array.from(this.selectedEntities);
        let cmd = (0,_command_componentEdit__WEBPACK_IMPORTED_MODULE_3__.componentEditCommand)();
        for (let entity of oldEntities) {
            let changes = {};
            changes[propertyName] = propertyValue;
            cmd.edit.push({
                type,
                entity,
                multiId,
                changes
            });
        }
        this.ecs.events.emit("command_log", cmd);
        this.update();
    }
    moveAll(diffX, diffY) {
        let cmd = (0,_command_componentEdit__WEBPACK_IMPORTED_MODULE_3__.componentEditCommand)();
        for (let entity of this.selectedEntities) {
            let pos = this.ecs.getComponent(entity, _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
            if (pos === undefined)
                continue;
            cmd.edit.push({
                type: _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE,
                entity: entity,
                changes: {
                    x: pos.x + diffX,
                    y: pos.y + diffY,
                },
            });
        }
        // partial = isTranslating (and ignore the results)
        this.ecs.events.emit(_command_commandSystem__WEBPACK_IMPORTED_MODULE_4__.EVENT_COMMAND_LOG, cmd, undefined, this.isTranslating);
        if (this.isTranslating)
            this.translateDirty = true;
        else
            this.update();
    }
    getOrCreateData(type) {
        let data = this.dataByType.get(type);
        if (data === undefined) {
            data = {
                entities: new Set(),
            };
            this.dataByType.set(type, data);
        }
        return data;
    }
    hasComponentType(type) {
        let data = this.dataByType.get(type);
        if (data === undefined)
            return false;
        return data.entities.size > 0;
    }
    hasEveryoneType(type) {
        let data = this.dataByType.get(type);
        if (data === undefined)
            return false;
        return data.entities.size === this.selectedEntities.size;
    }
    enable() {
    }
    destroy() {
    }
}
function removePrivate(target, filter) {
    for (let name in filter) {
        if (name[0] === '_')
            continue;
        target[name] = filter[name];
    }
    return target;
}
function biFilterObj(target, filter) {
    for (let name in filter) {
        if (name[0] === '_')
            continue;
        if (target[name] !== filter[name]) {
            target[name] = undefined;
        }
    }
    for (let name in target) {
        if (name[0] === '_')
            continue;
        if (filter[name] === undefined) {
            target[name] = undefined;
        }
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/textSystem.ts":
/*!*******************************************!*\
  !*** ./src/app/ecs/systems/textSystem.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TEXT_TYPE": () => (/* binding */ TEXT_TYPE),
/* harmony export */   "TextSystem": () => (/* binding */ TextSystem)
/* harmony export */ });
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _util_pixi__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/pixi */ "./src/app/util/pixi.ts");
/* harmony import */ var _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../phase/editMap/displayPrecedence */ "./src/app/phase/editMap/displayPrecedence.ts");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../index */ "./src/app/index.ts");




const TEXT_TYPE = 'text';
class TextSystem {
    constructor() {
        this.name = TEXT_TYPE;
        this.dependencies = [];
        this.textLayer = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.display.Layer();
    }
    enable() {
        this.textLayer.zIndex = _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_2__.DisplayPrecedence.TEXT;
        this.textLayer.interactive = false;
        this.textLayer.interactiveChildren = false;
        _index__WEBPACK_IMPORTED_MODULE_3__.app.stage.addChild(this.textLayer);
    }
    destroy() {
        this.textLayer.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_1__.DESTROY_ALL);
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/toolSystem.ts":
/*!*******************************************!*\
  !*** ./src/app/ecs/systems/toolSystem.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TOOL_TYPE": () => (/* binding */ TOOL_TYPE),
/* harmony export */   "ToolSystem": () => (/* binding */ ToolSystem)
/* harmony export */ });
/* harmony import */ var _pixiBoardSystem__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pixiBoardSystem */ "./src/app/ecs/systems/pixiBoardSystem.ts");
/* harmony import */ var _selectionSystem__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./selectionSystem */ "./src/app/ecs/systems/selectionSystem.ts");
/* harmony import */ var _tools_inspect__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../tools/inspect */ "./src/app/ecs/tools/inspect.ts");
/* harmony import */ var _tools_toolType__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../tools/toolType */ "./src/app/ecs/tools/toolType.ts");




const TOOL_TYPE = 'tool';
class ToolSystem {
    constructor(world) {
        this.name = TOOL_TYPE;
        this.dependencies = [_selectionSystem__WEBPACK_IMPORTED_MODULE_1__.SELECTION_TYPE];
        this.optionalDependencies = [_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_0__.PIXI_BOARD_TYPE];
        this.standardTool = _tools_toolType__WEBPACK_IMPORTED_MODULE_3__.Tool.INSPECT;
        this.tools = new Map();
        this.world = world;
        world.addResource({
            type: TOOL_TYPE,
            _save: true,
            _sync: false,
            tool: undefined,
        });
        const events = world.events;
        events.on('resource_edited', this.onResourceEdited, this);
        events.on(_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_0__.PointerEvents.POINTER_MOVE, this.onPointerMove, this);
        events.on(_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_0__.PointerEvents.POINTER_DOWN, this.onPointerDown, this);
        events.on(_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_0__.PointerEvents.POINTER_UP, this.onPointerUp, this);
        events.on(_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_0__.PointerEvents.POINTER_RIGHT_DOWN, this.onPointerRightDown, this);
        events.on(_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_0__.PointerEvents.POINTER_RIGHT_UP, this.onPointerRightUp, this);
        events.on(_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_0__.PointerEvents.POINTER_CLICK, this.onPointerClick, this);
        this.addTool(new _tools_inspect__WEBPACK_IMPORTED_MODULE_2__.InspectToolDriver(world));
    }
    addTool(tool) {
        this.tools.set(tool.name, tool);
    }
    onResourceEdited(r, edited) {
        var _a;
        if (r.type === TOOL_TYPE) {
            let ct = r;
            let toolName = ct.tool || this.standardTool;
            let tool = this.tools.get(toolName);
            if (tool === undefined) {
                console.warn("Unregistered tool requested: " + ct.tool);
                tool = this.tools.get(this.standardTool);
            }
            if (tool === this.currentTool) {
                return;
            }
            console.log("Changing tool from " + (((_a = this.currentTool) === null || _a === void 0 ? void 0 : _a.name) || 'none') + " to " + tool.name);
            if (this.currentTool !== undefined && this.currentTool.onEnd !== undefined) {
                this.currentTool.onEnd();
            }
            this.currentTool = tool;
            if (tool.onStart !== undefined)
                tool.onStart();
        }
    }
    onPointerMove(e) {
        if (this.currentTool !== undefined && this.currentTool.onPointerMove !== undefined) {
            this.currentTool.onPointerMove(e);
        }
    }
    onPointerDown(e) {
        if (this.currentTool !== undefined && this.currentTool.onPointerDown !== undefined) {
            this.currentTool.onPointerDown(e);
        }
    }
    onPointerUp(e) {
        if (this.currentTool !== undefined && this.currentTool.onPointerUp !== undefined) {
            this.currentTool.onPointerUp(e);
        }
    }
    onPointerRightDown(e) {
        if (this.currentTool !== undefined && this.currentTool.onPointerRightDown !== undefined) {
            this.currentTool.onPointerRightDown(e);
        }
    }
    onPointerRightUp(e) {
        if (this.currentTool !== undefined && this.currentTool.onPointerRightUp !== undefined) {
            this.currentTool.onPointerRightUp(e);
        }
    }
    onPointerClick(e) {
        if (this.currentTool !== undefined && this.currentTool.onPointerClick !== undefined) {
            this.currentTool.onPointerClick(e);
        }
    }
    enable() {
        for (let tool of this.tools.values()) {
            if (tool.initialize !== undefined)
                tool.initialize();
        }
        if (this.currentTool === undefined) {
            this.world.editResource(TOOL_TYPE, {
                tool: this.standardTool,
            });
        }
    }
    destroy() {
        for (let tool of this.tools.values()) {
            if (tool.destroy !== undefined)
                tool.destroy();
        }
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/visibilityAwareSystem.ts":
/*!******************************************************!*\
  !*** ./src/app/ecs/systems/visibilityAwareSystem.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VISIBILITY_AWARE_TYPE": () => (/* binding */ VISIBILITY_AWARE_TYPE),
/* harmony export */   "newVisibilityAwareComponent": () => (/* binding */ newVisibilityAwareComponent),
/* harmony export */   "VisibilityAwareSystem": () => (/* binding */ VisibilityAwareSystem)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./src/app/ecs/component.ts");
/* harmony import */ var _visibilitySystem__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./visibilitySystem */ "./src/app/ecs/systems/visibilitySystem.ts");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../storage */ "./src/app/ecs/storage.ts");
/* harmony import */ var _util_array__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../util/array */ "./src/app/util/array.ts");
/* harmony import */ var _interactionSystem__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./interactionSystem */ "./src/app/ecs/systems/interactionSystem.ts");
/* harmony import */ var _geometry_aabb__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../geometry/aabb */ "./src/app/geometry/aabb.ts");
/* harmony import */ var _gridSystem__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./gridSystem */ "./src/app/ecs/systems/gridSystem.ts");
/* harmony import */ var _game_grid__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../game/grid */ "./src/app/game/grid.ts");
/* harmony import */ var _util_safeEventEmitter__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../util/safeEventEmitter */ "./src/app/util/safeEventEmitter.ts");









const VISIBILITY_AWARE_TYPE = 'visibility_aware';
function newVisibilityAwareComponent(isWall = false) {
    return {
        type: VISIBILITY_AWARE_TYPE,
        entity: -1,
        visibleBy: [],
        isWall,
    };
}
class VisibilityAwareSystem {
    constructor(world) {
        var _a;
        this.name = VISIBILITY_AWARE_TYPE;
        this.dependencies = [_visibilitySystem__WEBPACK_IMPORTED_MODULE_1__.VISIBILITY_TYPE, _interactionSystem__WEBPACK_IMPORTED_MODULE_4__.INTERACTION_TYPE];
        this.storage = new _storage__WEBPACK_IMPORTED_MODULE_2__.SingleEcsStorage(VISIBILITY_AWARE_TYPE, false, false);
        /**
         * Events:
         * aware_update(component, added, removed)
         *   Called when a VisibilityAware entity is updated
         *   why can't we do this with a normal component_edit event?
         *   It's easier not to build component diffs.
         *   If you want to track old values do it on your own.
         */
        this.events = new _util_safeEventEmitter__WEBPACK_IMPORTED_MODULE_8__.default();
        this.world = world;
        this.visibilitySys = this.world.systems.get(_visibilitySystem__WEBPACK_IMPORTED_MODULE_1__.VISIBILITY_TYPE);
        this.interactionSys = this.world.systems.get(_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.INTERACTION_TYPE);
        world.addStorage(this.storage);
        this.gridSize = ((_a = this.world.getResource(_gridSystem__WEBPACK_IMPORTED_MODULE_6__.GRID_TYPE)) !== null && _a !== void 0 ? _a : _game_grid__WEBPACK_IMPORTED_MODULE_7__.STANDARD_GRID_OPTIONS).size;
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
    }
    visibilityChange(viewer, polygon, range) {
        range *= this.gridSize;
        if (polygon === undefined) {
            // Player visibility null
            let oldCanSee = viewer._canSee;
            viewer._canSee = [];
            for (let x of oldCanSee) {
                let target = this.storage.getComponent(x);
                if (target === undefined)
                    continue;
                (0,_util_array__WEBPACK_IMPORTED_MODULE_3__.arrayRemoveElem)(target.visibleBy, viewer.entity);
                this.events.emit('aware_update', target, [], [viewer.entity]);
            }
            return;
        }
        let oldCanSee = viewer._canSee;
        viewer._canSee = [];
        let posStorage = this.world.storages.get(_component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
        let interStorage = this.world.storages.get(_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.INTERACTION_TYPE);
        let viewerPos = posStorage.getComponent(viewer.entity);
        let viewerPoly = (0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapePolygon)(polygon);
        let viewerCircle = (0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapeCircle)(viewerPos, range);
        // Check if old awares can still be seen
        for (let i of oldCanSee) {
            let shape = interStorage.getComponent(i).shape;
            if ((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapeIntersect)(viewerPoly, shape) && (0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapeIntersect)(viewerCircle, shape)) {
                viewer._canSee.push(i);
            }
            else {
                let target = this.storage.getComponent(i);
                // No need to remove target.entity from player._canSee as it's already been removed
                (0,_util_array__WEBPACK_IMPORTED_MODULE_3__.arrayRemoveElem)(target.visibleBy, viewer.entity);
                this.events.emit('aware_update', target, [], [viewer.entity]);
            }
        }
        let iter = this.interactionSys.query(viewerPoly, c => {
            let target = this.storage.getComponent(c.entity);
            return target !== undefined && target.isWall !== true && oldCanSee.indexOf(c.entity) === -1;
        });
        for (let e of iter) {
            let shape = interStorage.getComponent(e.entity).shape;
            if (!(0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapeIntersect)(viewerCircle, shape))
                continue;
            let target = this.storage.getComponent(e.entity);
            viewer._canSee.push(e.entity);
            target.visibleBy.push(viewer.entity);
            this.events.emit('aware_update', target, [viewer.entity], []);
        }
    }
    visibleElementMove(aware) {
        var _a;
        if (aware.isWall === true)
            return;
        let posStorage = this.world.storages.get(_component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
        let visStorage = this.world.storages.get(_visibilitySystem__WEBPACK_IMPORTED_MODULE_1__.VISIBILITY_TYPE);
        let pos = posStorage.getComponent(aware.entity);
        let shape = this.world.getComponent(aware.entity, _interactionSystem__WEBPACK_IMPORTED_MODULE_4__.INTERACTION_TYPE).shape;
        let oldVisibleBy = aware.visibleBy;
        aware.visibleBy = [];
        let added = [];
        let removed = [];
        // Search for new players
        for (let p of this.visibilitySys.aabbTree.query(_geometry_aabb__WEBPACK_IMPORTED_MODULE_5__.Aabb.fromPoint(pos))) {
            let entity = p.tag.entity;
            let vis = visStorage.getComponent(entity);
            if (vis === undefined || oldVisibleBy.indexOf(entity) !== -1)
                continue;
            let ppos = posStorage.getComponent(entity);
            let pvis = visStorage.getComponent(entity);
            let range = pvis.range * this.gridSize;
            if (!(0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapeIntersect)((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapeCircle)(ppos, range), shape) || !(0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapeIntersect)(shape, (0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapePolygon)((_a = p.tag) === null || _a === void 0 ? void 0 : _a.polygon)))
                continue;
            vis._canSee.push(aware.entity);
            aware.visibleBy.push(vis.entity);
            added.push(vis.entity);
        }
        // Check for old players
        for (let p of oldVisibleBy) {
            let vis = visStorage.getComponent(p);
            let ppos = posStorage.getComponent(p);
            let pvis = visStorage.getComponent(p);
            let range = pvis.range * this.gridSize;
            if ((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapeIntersect)((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapeCircle)(ppos, range), shape) && (0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapeIntersect)(shape, (0,_interactionSystem__WEBPACK_IMPORTED_MODULE_4__.shapePolygon)(pvis.polygon))) {
                aware.visibleBy.push(p);
                continue;
            }
            // No need to remove e._visibleBy as it's already been cleared
            (0,_util_array__WEBPACK_IMPORTED_MODULE_3__.arrayRemoveElem)(vis._canSee, aware.entity);
            removed.push(vis.entity);
        }
        if (added.length + removed.length > 0) {
            this.events.emit('aware_update', aware, added, removed);
        }
    }
    onViewBlockerEdited(viewer, newWalls, oldWalls) {
        oldWalls = oldWalls || [];
        if (newWalls.length === 0) {
            // Player visibility null
            for (let x of oldWalls) {
                let target = this.storage.getComponent(x);
                if (target === undefined)
                    continue;
                (0,_util_array__WEBPACK_IMPORTED_MODULE_3__.arrayRemoveElem)(target.visibleBy, viewer.entity);
                this.events.emit('aware_update', target, [], [viewer.entity]);
            }
            return;
        }
        let commonWalls = [];
        //console.log("WALL UPDATE, old: " + oldWalls + " new: " + newWalls);
        // Check if old awares can still be seen
        for (let i of oldWalls) {
            if (newWalls.indexOf(i) !== -1) {
                //console.log("| =" + i);
                commonWalls.push(i);
                continue;
            }
            let target = this.storage.getComponent(i);
            if (target === undefined) {
                //console.log("| %" + i);
                continue;
            }
            //console.log("| -" + target.entity);
            (0,_util_array__WEBPACK_IMPORTED_MODULE_3__.arrayRemoveElem)(target.visibleBy, viewer.entity);
            this.events.emit('aware_update', target, [], [viewer.entity]);
        }
        for (let e of newWalls) {
            if (commonWalls.indexOf(e) !== -1)
                continue;
            let target = this.storage.getComponent(e);
            if (target === undefined) {
                //console.log("| ^" + e);
                continue;
            }
            //console.log("| +" + target.entity);
            target.visibleBy.push(viewer.entity);
            this.events.emit('aware_update', target, [viewer.entity], []);
        }
    }
    onComponentAdd(comp) {
        if (comp.type === VISIBILITY_AWARE_TYPE) {
            this.visibleElementMove(comp);
        }
    }
    onComponentEdited(comp, changed) {
        if (comp.type === _visibilitySystem__WEBPACK_IMPORTED_MODULE_1__.VISIBILITY_TYPE) {
            let vis = comp;
            if ('polygon' in changed) {
                this.visibilityChange(vis, vis.polygon, vis.range);
            }
            if ('_canSeeWalls' in changed) {
                this.onViewBlockerEdited(vis, vis._canSeeWalls, changed.walls);
            }
        }
        else if (comp.type === _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE) {
            let visAware = this.storage.getComponent(comp.entity);
            if (visAware === undefined)
                return;
            this.visibleElementMove(visAware);
        }
    }
    onComponentRemove(comp) {
        if (comp.type === _visibilitySystem__WEBPACK_IMPORTED_MODULE_1__.VISIBILITY_TYPE) {
            let vis = comp;
            this.visibilityChange(vis, undefined, 0);
            this.onViewBlockerEdited(vis, [], vis._canSeeWalls);
        }
        else if (comp.type === VISIBILITY_AWARE_TYPE) {
            let va = comp;
            va.visibleBy;
            let visStorage = this.world.storages.get(_visibilitySystem__WEBPACK_IMPORTED_MODULE_1__.VISIBILITY_TYPE);
            for (let p of va.visibleBy) {
                let vis = visStorage.getComponent(p);
                (0,_util_array__WEBPACK_IMPORTED_MODULE_3__.arrayRemoveElem)(vis._canSee, va.entity);
            }
        }
    }
    onResourceEdited(res, changed) {
        if (res.type === _gridSystem__WEBPACK_IMPORTED_MODULE_6__.GRID_TYPE && 'size' in changed) {
            let grid = res;
            this.gridSize = grid.size;
            // We don't really care, the visibility polygons will change on their own
        }
    }
    enable() {
    }
    destroy() {
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/visibilitySystem.ts":
/*!*************************************************!*\
  !*** ./src/app/ecs/systems/visibilitySystem.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VISIBILITY_TYPE": () => (/* binding */ VISIBILITY_TYPE),
/* harmony export */   "VISIBILITY_BLOCKER_TYPE": () => (/* binding */ VISIBILITY_BLOCKER_TYPE),
/* harmony export */   "VisibilitySystem": () => (/* binding */ VisibilitySystem)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./src/app/ecs/component.ts");
/* harmony import */ var _geometry_aabb__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../geometry/aabb */ "./src/app/geometry/aabb.ts");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../storage */ "./src/app/ecs/storage.ts");
/* harmony import */ var _geometry_dynamicTree__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../geometry/dynamicTree */ "./src/app/geometry/dynamicTree.ts");
/* harmony import */ var _geometry_visibilityPolygon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../geometry/visibilityPolygon */ "./src/app/geometry/visibilityPolygon.ts");
/* harmony import */ var _interactionSystem__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./interactionSystem */ "./src/app/ecs/systems/interactionSystem.ts");
/* harmony import */ var _game_grid__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../game/grid */ "./src/app/game/grid.ts");
/* harmony import */ var _gridSystem__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./gridSystem */ "./src/app/ecs/systems/gridSystem.ts");
/* provided dependency */ var PIXI = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/pixi.es.js");








const VISIBILITY_TYPE = 'visibility';
const VISIBILITY_BLOCKER_TYPE = 'visibility_blocker';
/**
 * Please don't stick a visibility component to an entity with a wall component (or vice-versa),
 * they don't go along together too much, for a lot of reasons.
 *
 * This system queries every entity with a VisibilityComponent and keeps it updated, by that I mean:
 * - Recompute the visibility polygon when the range changes
 * - Recompute the visibility polygon when the walls change
 *
 * Little note on visibility polygon algorithms:
 * General polygons are a mess to deal with, but the visibility polygon is a bit easier than most.
 * Since there are no portals nor mirrors in the game (yet!) each point in the polygon is visible from the center.
 * How can this property help in any way? Let me make an example:
 * We can easily compute if a point is inside of this polygon by doing a binary search on the angles, so the algorithm
 * becomes of complexity O(log(n)) where n are the polygon points.
 * Another property that I'm using is that a visibility polygon is much easier to triangulate!
 * Cut off all those ear cutting algorithms, just make triangles starting from the center!
 */
class VisibilitySystem {
    constructor(world) {
        var _a;
        this.name = VISIBILITY_TYPE;
        this.dependencies = [_interactionSystem__WEBPACK_IMPORTED_MODULE_5__.INTERACTION_TYPE];
        this.storage = new _storage__WEBPACK_IMPORTED_MODULE_2__.SingleEcsStorage(VISIBILITY_TYPE, false, false);
        this.blockerStorage = new _storage__WEBPACK_IMPORTED_MODULE_2__.SingleEcsStorage(VISIBILITY_BLOCKER_TYPE, false, false);
        this.aabbTree = new _geometry_dynamicTree__WEBPACK_IMPORTED_MODULE_3__.DynamicTree();
        this.world = world;
        this.interactionSystem = this.world.systems.get(_interactionSystem__WEBPACK_IMPORTED_MODULE_5__.INTERACTION_TYPE);
        this.gridSize = ((_a = this.world.getResource(_gridSystem__WEBPACK_IMPORTED_MODULE_7__.GRID_TYPE)) !== null && _a !== void 0 ? _a : _game_grid__WEBPACK_IMPORTED_MODULE_6__.STANDARD_GRID_OPTIONS).size;
        world.addStorage(this.storage);
        world.addStorage(this.blockerStorage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_removed', this.onComponentRemoved, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
    }
    removeTreePolygon(c) {
        if (c._aabbTreeId !== undefined) {
            this.aabbTree.destroyProxy(c._aabbTreeId);
            c._aabbTreeId = undefined;
        }
    }
    updatePolygon(c) {
        // Ignore if it's hidden.
        if (this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE))
            return;
        let pos = this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE);
        if (pos === undefined)
            return;
        // We will recreate it later (if necessary)
        this.removeTreePolygon(c);
        if (c.range <= 0) {
            this.world.editComponent(c.entity, c.type, {
                polygon: undefined,
                polygonAabb: undefined,
                aabb: undefined,
            });
            return;
        }
        let range = c.range * this.gridSize;
        let viewport = new _geometry_aabb__WEBPACK_IMPORTED_MODULE_1__.Aabb(pos.x - range, pos.y - range, pos.x + range, pos.y + range);
        let lines = new Array();
        let blockerIds = new Array();
        let query = this.interactionSystem.query((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_5__.shapeAabb)(viewport), c => {
            return this.blockerStorage.getComponent(c.entity) !== undefined;
        });
        for (let entry of query) {
            let s = entry.shape;
            if (s.type !== _interactionSystem__WEBPACK_IMPORTED_MODULE_5__.ShapeType.LINE)
                throw 'Only line is supported as light blocker shape';
            lines.push(s.data);
            blockerIds.push(entry.entity);
        }
        let usedBlockers;
        if (c.trackWalls === true) {
            usedBlockers = new Array();
        }
        else {
            usedBlockers = undefined;
        }
        let polygon = (0,_geometry_visibilityPolygon__WEBPACK_IMPORTED_MODULE_4__.computeViewport)(lines, viewport, pos, usedBlockers);
        // Recycle the unused viewport object
        viewport.wrapPolygon(polygon);
        if (usedBlockers !== undefined) {
            for (let i = 0; i < usedBlockers.length; i++) {
                usedBlockers[i] = blockerIds[usedBlockers[i]];
            }
        }
        this.world.editComponent(c.entity, c.type, {
            polygon,
            aabb: viewport,
            _canSeeWalls: usedBlockers,
        });
        c._aabbTreeId = this.aabbTree.createProxy(viewport, c);
    }
    recomputeArea(aabb) {
        for (let node of [...this.aabbTree.query(aabb)]) {
            this.updatePolygon(node.tag);
        }
    }
    onComponentAdd(c) {
        if (c.type === VISIBILITY_TYPE) {
            let v = c;
            v._canSee = [];
            this.updatePolygon(v);
        }
        else if (c.type === VISIBILITY_BLOCKER_TYPE) {
            let cmp = this.world.getComponent(c.entity, _interactionSystem__WEBPACK_IMPORTED_MODULE_5__.INTERACTION_TYPE);
            if (cmp !== undefined) {
                this.recomputeArea((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_5__.shapeToAabb)(cmp.shape));
            }
        }
        else if (c.type === _interactionSystem__WEBPACK_IMPORTED_MODULE_5__.INTERACTION_TYPE && this.blockerStorage.getComponent(c.entity) !== undefined) {
            this.recomputeArea((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_5__.shapeToAabb)(c.shape));
        }
        else if (c.type === _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE) {
            // Component hidden is like component missing, they won't be able to see a thing
            let vis = this.storage.getComponent(c.entity);
            if (vis !== undefined) {
                this.removeVisibility(vis);
            }
            let blo = this.blockerStorage.getComponent(c.entity);
            if (blo !== undefined) {
                this.removeVisibilityBlocker(blo);
            }
        }
    }
    onComponentEdited(c, changes) {
        if (this.world.getComponent(c.entity, _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE))
            return;
        if (c.type === VISIBILITY_TYPE) {
            if ('range' in changes) {
                this.updatePolygon(c);
            }
        }
        else if (c.type === _component__WEBPACK_IMPORTED_MODULE_0__.POSITION_TYPE) {
            let vis = this.storage.getComponent(c.entity);
            if (vis !== undefined) {
                this.updatePolygon(vis);
            }
            let blk = this.blockerStorage.getComponent(c.entity);
            if (blk !== undefined) {
                let inter = this.world.getComponent(blk.entity, _interactionSystem__WEBPACK_IMPORTED_MODULE_5__.INTERACTION_TYPE);
                this.recomputeArea((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_5__.shapeToAabb)(inter.shape));
            }
        }
        else if (c.type === _interactionSystem__WEBPACK_IMPORTED_MODULE_5__.INTERACTION_TYPE && 'shape' in changes && this.blockerStorage.getComponent(c.entity) !== undefined) {
            let i = c;
            this.recomputeArea((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_5__.shapeToAabb)(i.shape));
        }
    }
    onComponentRemoved(c) {
        if (c.type === VISIBILITY_TYPE) {
            this.removeVisibility(c);
        }
        else if (c.type === VISIBILITY_BLOCKER_TYPE) {
            this.removeVisibilityBlocker(c);
        }
        else if (c.type === _interactionSystem__WEBPACK_IMPORTED_MODULE_5__.INTERACTION_TYPE && this.blockerStorage.getComponent(c.entity) !== undefined) {
            let i = c;
            this.recomputeArea((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_5__.shapeToAabb)(i.shape));
        }
        else if (c.type === _component__WEBPACK_IMPORTED_MODULE_0__.HOST_HIDDEN_TYPE) {
            // Welcome to the visible!
            let vis = this.storage.getComponent(c.entity);
            if (vis !== undefined) {
                this.updatePolygon(vis);
            }
            let blo = this.blockerStorage.getComponent(c.entity);
            if (blo !== undefined) {
                let cmp = this.world.getComponent(c.entity, _interactionSystem__WEBPACK_IMPORTED_MODULE_5__.INTERACTION_TYPE);
                if (cmp !== undefined) {
                    this.recomputeArea((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_5__.shapeToAabb)(cmp.shape));
                }
            }
        }
    }
    onResourceEdited(res, changed) {
        if (res.type === _gridSystem__WEBPACK_IMPORTED_MODULE_7__.GRID_TYPE && 'size' in changed) {
            let grid = res;
            this.gridSize = grid.size;
            // Update everything in the next tick so that everyone sees the changes first
            PIXI.Ticker.shared.addOnce(() => {
                for (let c of this.storage.allComponents()) {
                    this.updatePolygon(c);
                }
            });
        }
    }
    removeVisibility(c) {
        this.removeTreePolygon(c);
    }
    removeVisibilityBlocker(c) {
        let cmp = this.world.getComponent(c.entity, _interactionSystem__WEBPACK_IMPORTED_MODULE_5__.INTERACTION_TYPE);
        if (cmp !== undefined) {
            this.recomputeArea((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_5__.shapeToAabb)(cmp.shape));
        }
    }
    enable() {
    }
    destroy() {
    }
}


/***/ }),

/***/ "./src/app/ecs/systems/wallSystem.ts":
/*!*******************************************!*\
  !*** ./src/app/ecs/systems/wallSystem.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WALL_TYPE": () => (/* binding */ WALL_TYPE),
/* harmony export */   "WallSystem": () => (/* binding */ WallSystem),
/* harmony export */   "CreateWallToolDriver": () => (/* binding */ CreateWallToolDriver)
/* harmony export */ });
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _util_pixi__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/pixi */ "./src/app/util/pixi.ts");
/* harmony import */ var _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../phase/editMap/displayPrecedence */ "./src/app/phase/editMap/displayPrecedence.ts");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../storage */ "./src/app/ecs/storage.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../component */ "./src/app/ecs/component.ts");
/* harmony import */ var _util_geometry__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../util/geometry */ "./src/app/util/geometry.ts");
/* harmony import */ var _geometry_aabb__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../geometry/aabb */ "./src/app/geometry/aabb.ts");
/* harmony import */ var _geometry_line__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../geometry/line */ "./src/app/geometry/line.ts");
/* harmony import */ var _geometry_collision__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../geometry/collision */ "./src/app/geometry/collision.ts");
/* harmony import */ var _interactionSystem__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./interactionSystem */ "./src/app/ecs/systems/interactionSystem.ts");
/* harmony import */ var _visibilitySystem__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./visibilitySystem */ "./src/app/ecs/systems/visibilitySystem.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../graphics */ "./src/app/graphics.ts");
/* harmony import */ var _toolSystem__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./toolSystem */ "./src/app/ecs/systems/toolSystem.ts");
/* harmony import */ var _pixiBoardSystem__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./pixiBoardSystem */ "./src/app/ecs/systems/pixiBoardSystem.ts");
/* harmony import */ var _tools_utils__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../tools/utils */ "./src/app/ecs/tools/utils.ts");
/* harmony import */ var _selectionSystem__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./selectionSystem */ "./src/app/ecs/systems/selectionSystem.ts");
/* harmony import */ var _tools_toolType__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../tools/toolType */ "./src/app/ecs/tools/toolType.ts");
/* harmony import */ var _command_command__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./command/command */ "./src/app/ecs/systems/command/command.ts");
/* harmony import */ var _util_array__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../util/array */ "./src/app/util/array.ts");



















const WALL_TYPE = 'wall';
const SELECTION_COLOR = 0x7986CB;
class WallSystem {
    constructor(world) {
        this.name = WALL_TYPE;
        this.dependencies = [_interactionSystem__WEBPACK_IMPORTED_MODULE_9__.INTERACTION_TYPE, _graphics__WEBPACK_IMPORTED_MODULE_11__.GRAPHIC_TYPE, _toolSystem__WEBPACK_IMPORTED_MODULE_12__.TOOL_TYPE, _selectionSystem__WEBPACK_IMPORTED_MODULE_15__.SELECTION_TYPE];
        this.storage = new _storage__WEBPACK_IMPORTED_MODULE_3__.SingleEcsStorage(WALL_TYPE);
        this.isTranslating = false;
        this.world = world;
        // Only masters can create walls
        if (this.world.isMaster) {
            let toolSys = world.systems.get(_toolSystem__WEBPACK_IMPORTED_MODULE_12__.TOOL_TYPE);
            toolSys.addTool(new CreateWallToolDriver(this));
        }
        this.interactionSys = world.systems.get(_interactionSystem__WEBPACK_IMPORTED_MODULE_9__.INTERACTION_TYPE);
        this.selectionSys = world.systems.get(_selectionSystem__WEBPACK_IMPORTED_MODULE_15__.SELECTION_TYPE);
        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('tool_move_begin', this.onToolMoveBegin, this);
        world.events.on('tool_move_end', this.onToolMoveEnd, this);
    }
    onComponentAdd(component) {
        if (component.type !== WALL_TYPE)
            return;
        let wall = component;
        let pos = this.world.getComponent(wall.entity, _component__WEBPACK_IMPORTED_MODULE_4__.POSITION_TYPE);
        if (pos === undefined) {
            console.warn("Found wall without position, please add first the position, then the wall");
            return;
        }
        wall._dontMerge = 0;
        this.world.addComponent(component.entity, {
            type: _graphics__WEBPACK_IMPORTED_MODULE_11__.GRAPHIC_TYPE,
            entity: -1,
            display: {
                type: _graphics__WEBPACK_IMPORTED_MODULE_11__.ElementType.LINE,
                ignore: false,
                visib: _graphics__WEBPACK_IMPORTED_MODULE_11__.VisibilityType.REMEMBER,
                priority: _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_2__.DisplayPrecedence.WALL,
                vec: { x: wall.vec[0], y: wall.vec[1] },
            },
            interactive: true,
            isWall: true,
        });
        this.world.addComponent(component.entity, {
            type: _visibilitySystem__WEBPACK_IMPORTED_MODULE_10__.VISIBILITY_BLOCKER_TYPE,
            entity: -1
        });
    }
    fixWallPreTranslation(walls) {
        for (let wall of walls) {
            let visBlock = this.world.getComponent(wall.entity, _visibilitySystem__WEBPACK_IMPORTED_MODULE_10__.VISIBILITY_BLOCKER_TYPE);
            if (visBlock !== undefined)
                this.world.removeComponent(visBlock);
        }
        // what changes here? a little bittle thing:
        // we need to unfix the wall (remove the intersection breaks).
        let wall_index = new Map();
        let posStorage = this.world.storages.get(_component__WEBPACK_IMPORTED_MODULE_4__.POSITION_TYPE);
        let insertInIndex = (index, wall) => {
            let list = wall_index.get(index);
            if (list === undefined) {
                list = [];
                wall_index.set(index, list);
            }
            list.push(wall);
        };
        for (let wall of walls) {
            if (wall._dontMerge !== 0)
                continue;
            let pos = posStorage.getComponent(wall.entity);
            let p1 = pos.x + "@" + pos.y;
            let p2 = (pos.x + wall.vec[0]) + "@" + (pos.y + wall.vec[1]);
            let tryMerge = (index) => {
                let mergeWithIndex = undefined;
                let walls = wall_index.get(index);
                if (walls === undefined)
                    return false;
                let wlen = walls.length;
                for (let i = 0; i < wlen; i++) {
                    let owall = walls[i];
                    if ((0,_geometry_collision__WEBPACK_IMPORTED_MODULE_8__.lineSameSlope)(wall.vec[0], wall.vec[1], owall.vec[0], owall.vec[1])) {
                        mergeWithIndex = i;
                        break;
                    }
                }
                if (mergeWithIndex === undefined)
                    return false;
                let mwall = walls[mergeWithIndex];
                let mpos = posStorage.getComponent(mwall.entity);
                let minChanged = false;
                let x = pos.x;
                let y = pos.y;
                let dx = wall.vec[0];
                let dy = wall.vec[1];
                if (p2 === index) {
                    x += dx;
                    y += dy;
                    dx = -dx;
                    dy = -dy;
                }
                if (mpos.x === x && mpos.y === y) {
                    mpos.x += dx;
                    mpos.y += dy;
                    minChanged = true;
                }
                else {
                    mwall.vec[0] += wall.vec[0];
                    mwall.vec[1] += wall.vec[1];
                }
                walls.splice(mergeWithIndex, 1);
                let p;
                if (minChanged) {
                    p = mpos.x + "@" + mpos.y;
                }
                else {
                    p = (mpos.x + mwall.vec[0]) + "@" + (mpos.y + mwall.vec[1]);
                }
                insertInIndex(p, mwall);
                this.world.despawnEntity(wall.entity);
                this.redrawWall(mwall);
                return true;
            };
            if (tryMerge(p1) || tryMerge(p2))
                continue;
            insertInIndex(p1, wall);
            insertInIndex(p2, wall);
        }
    }
    fixWallPostTranslation(walls) {
        // Recompute intersections with other walls.
        // Why not all everything directly? we want to compute also the self-intersections
        let posStorage = this.world.storages.get(_component__WEBPACK_IMPORTED_MODULE_4__.POSITION_TYPE);
        for (let wall of walls) {
            let pos = posStorage.getComponent(wall.entity);
            let points = [pos.x, pos.y, pos.x + wall.vec[0], pos.y + wall.vec[1]];
            this.fixIntersections(points, 0);
            this.world.editComponent(pos.entity, _interactionSystem__WEBPACK_IMPORTED_MODULE_9__.INTERACTION_TYPE, {
                shape: (0,_interactionSystem__WEBPACK_IMPORTED_MODULE_9__.shapeLine)(new _geometry_line__WEBPACK_IMPORTED_MODULE_7__.Line(points[0], points[1], points[2], points[3])),
            });
            if (points.length > 4) {
                pos.x = points[0];
                pos.y = points[1];
                wall.vec[0] = points[2] - pos.x;
                wall.vec[1] = points[3] - pos.y;
            }
            this.redrawWall(wall);
            let plen = points.length;
            let cIds = [];
            let entities = [];
            for (let i = 4; i < plen; i += 2) {
                let entity = this.createWall(points[i - 2], points[i - 1], points[i], points[i + 1]);
                cIds.push(entity.id);
                entities.push(entity);
            }
            this.world.respawnEntities(entities);
            if (cIds.length > 0) {
                this.selectionSys.addEntities(cIds);
                // TODO: optimization, update the selection only once!
            }
        }
        for (let wall of walls) {
            this.world.addComponent(wall.entity, {
                type: "visibility_blocker",
                entity: -1
            });
        }
    }
    onComponentEdited(comp, changed) {
        if (comp.type !== WALL_TYPE && comp.type !== _component__WEBPACK_IMPORTED_MODULE_4__.POSITION_TYPE)
            return;
        let wall, position;
        if (comp.type === WALL_TYPE) {
            wall = comp;
            position = this.world.getComponent(comp.entity, _component__WEBPACK_IMPORTED_MODULE_4__.POSITION_TYPE);
        }
        else {
            wall = this.storage.getComponent(comp.entity);
            position = comp;
        }
        if (wall === undefined || position === undefined)
            return;
        if (!this.isTranslating) {
            this.fixWallPreTranslation([wall]);
            this.fixWallPostTranslation([wall]);
        }
        if (comp.type === WALL_TYPE && 'vec' in changed) {
            this.redrawWall(wall);
        }
    }
    redrawWall(wall) {
        let display = this.world.getComponent(wall.entity, _graphics__WEBPACK_IMPORTED_MODULE_11__.GRAPHIC_TYPE).display;
        display.vec = { x: wall.vec[0], y: wall.vec[1] };
        this.world.editComponent(wall.entity, _graphics__WEBPACK_IMPORTED_MODULE_11__.GRAPHIC_TYPE, { display }, undefined, false);
    }
    findLocationOnWall(point, radius) {
        let points = this.interactionSys.query((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_9__.shapeAabb)(new _geometry_aabb__WEBPACK_IMPORTED_MODULE_6__.Aabb(point.x - radius, point.y - radius, point.x + radius, point.y + radius)), c => {
            return this.storage.getComponent(c.entity) !== undefined;
        });
        let bestPoint = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Point();
        let bestDist = Number.POSITIVE_INFINITY;
        let tmpPoint = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Point();
        for (let node of points) {
            let line = node.shape.data;
            if (!line.projectPoint(point, tmpPoint)) {
                continue;
            }
            let dist = (0,_util_geometry__WEBPACK_IMPORTED_MODULE_5__.distSquared2d)(tmpPoint.x, tmpPoint.y, point.x, point.y);
            if (dist < bestDist && dist < radius) {
                bestPoint.copyFrom(tmpPoint);
                bestDist = dist;
            }
        }
        if (bestDist !== Number.POSITIVE_INFINITY) {
            return bestPoint;
        }
        else {
            return undefined;
        }
    }
    onComponentRemove(component) {
        if (component.type !== WALL_TYPE)
            return;
        let vblocker = this.world.getComponent(component.entity, _visibilitySystem__WEBPACK_IMPORTED_MODULE_10__.VISIBILITY_BLOCKER_TYPE);
        if (vblocker !== undefined) {
            this.world.removeComponent(vblocker);
        }
    }
    onToolMoveBegin() {
        this.isTranslating = true;
        let walls = [...this.selectionSys.getSelectedByType(WALL_TYPE)];
        this.fixWallPreTranslation(walls);
    }
    onToolMoveEnd() {
        this.isTranslating = false;
        let walls = [...this.selectionSys.getSelectedByType(WALL_TYPE)];
        this.fixWallPostTranslation(walls);
    }
    queryIntersections(posX, posY, vecX, vecY) {
        let strip = [posX, posY, posX + vecX, posY + vecY];
        let ids = new Array();
        this.fixIntersections(strip, 0, undefined, ids);
        return ids;
    }
    fixIntersections(strip, start, end, wallIds) {
        let aabb = new _geometry_aabb__WEBPACK_IMPORTED_MODULE_6__.Aabb(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        end = end === undefined ? strip.length : end;
        for (let i = start; i < end; i += 2) {
            aabb.minX = Math.min(aabb.minX, strip[i]);
            aabb.minY = Math.min(aabb.minY, strip[i + 1]);
            aabb.maxX = Math.max(aabb.maxX, strip[i]);
            aabb.maxY = Math.max(aabb.maxY, strip[i + 1]);
        }
        let tmpLine = new _geometry_line__WEBPACK_IMPORTED_MODULE_7__.Line(0, 0, 0, 0);
        let tmpPoint = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Point();
        let query = this.interactionSys.query((0,_interactionSystem__WEBPACK_IMPORTED_MODULE_9__.shapeAabb)(aabb), c => {
            return this.storage.getComponent(c.entity) !== undefined;
        });
        for (let wall of query) {
            //console.log("Checking wall: ", wall.tag);
            for (let i = start + 2; i < end; i += 2) {
                tmpLine.fromX = strip[i - 2];
                tmpLine.fromY = strip[i - 1];
                tmpLine.toX = strip[i];
                tmpLine.toY = strip[i + 1];
                let line = wall.shape.data;
                let res = (0,_geometry_collision__WEBPACK_IMPORTED_MODULE_8__.intersectSegmentVsSegment)(tmpLine, line, tmpPoint);
                // Only continue if the intersection is inside of both lines (not on the edge)
                if (res !== _geometry_collision__WEBPACK_IMPORTED_MODULE_8__.SegmentVsSegmentRes.INTERN)
                    continue;
                // Insert the intersection point in the strip
                //console.log("FIXING AT: " + tmpPoint.x + ", " + tmpPoint.y);
                strip.splice(i, 0, tmpPoint.x, tmpPoint.y);
                i += 2; // Skip this point
                end += 2;
                wallIds === null || wallIds === void 0 ? void 0 : wallIds.push(wall.entity);
            }
        }
        return end;
    }
    createWall(minX, minY, maxX, maxY) {
        let components = [
            {
                entity: -1,
                x: minX,
                y: minY,
                type: _component__WEBPACK_IMPORTED_MODULE_4__.POSITION_TYPE,
            },
            {
                type: WALL_TYPE,
                vec: [maxX - minX, maxY - minY],
            },
        ];
        return {
            id: this.world.allocateId(),
            components,
        };
    }
    enable() {
    }
    destroy() {
    }
}
class CreateWallToolDriver {
    constructor(sys) {
        this.name = _tools_toolType__WEBPACK_IMPORTED_MODULE_16__.Tool.CREATE_WALL;
        // Sprite of the pin to be created
        this.createdIds = [];
        this.isActive = false;
        this.mouseLastPos = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Point();
        this.sys = sys;
        this.createLastLineDisplay = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Graphics();
        this.pixiBoardSys = sys.world.systems.get(_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_13__.PIXI_BOARD_TYPE);
        sys.world.events.on('component_add', (c) => {
            if (this.isActive && c.type === 'wall') {
                this.createdIds.push(c.entity);
            }
        });
        sys.world.events.on('component_remove', (c) => {
            if (this.isActive && c.type === 'wall' && (0,_util_array__WEBPACK_IMPORTED_MODULE_18__.arrayRemoveElem)(this.createdIds, c.entity)) {
                this.recomputeCreatedLastPos();
            }
        });
    }
    initCreation() {
        this.endCreation();
    }
    endCreation() {
        this.createLastLineDisplay.clear();
        this.createdLastPos = undefined;
        if (this.createdIds.length === 0)
            return;
        this.sys.selectionSys.setOnlyEntities(this.createdIds);
        this.createdIds.length = 0;
        this.sys.world.editResource(_toolSystem__WEBPACK_IMPORTED_MODULE_12__.TOOL_TYPE, {
            tool: _tools_toolType__WEBPACK_IMPORTED_MODULE_16__.Tool.INSPECT,
        });
    }
    redrawCreationLastLine(pos) {
        this.mouseLastPos = pos;
        let g = this.createLastLineDisplay;
        g.clear();
        if (this.createdLastPos !== undefined) {
            g.moveTo(this.createdLastPos[0], this.createdLastPos[1]);
            g.lineStyle(5, SELECTION_COLOR);
            g.lineTo(pos.x, pos.y);
        }
        g.lineStyle(0);
        if (this.createdIds.length === 0 && this.createdLastPos !== undefined) {
            g.beginFill(0xe51010);
            g.drawCircle(this.createdLastPos[0], this.createdLastPos[1], 10);
        }
        g.beginFill(0x405FFE);
        g.drawCircle(pos.x, pos.y, 10);
    }
    addVertex(point) {
        let lp = this.createdLastPos;
        if (lp === undefined) {
            this.createdLastPos = [point.x, point.y];
        }
        else if (point.x == lp[0] && point.y == lp[1]) {
            this.endCreation();
        }
        else {
            let points = [lp[0], lp[1], point.x, point.y];
            this.sys.fixIntersections(points, 0);
            let plen = points.length;
            for (let i = 2; i < plen; i += 2) {
                let entity = this.sys.createWall(points[i - 2], points[i - 1], points[i], points[i + 1]);
                let cmd = {
                    kind: 'spawn',
                    entities: [entity]
                };
                (0,_command_command__WEBPACK_IMPORTED_MODULE_17__.executeAndLogCommand)(this.sys.world, cmd);
            }
            this.createdLastPos = [point.x, point.y];
        }
    }
    undoVertex(point) {
        if (this.createdLastPos === undefined)
            return;
        this.mouseLastPos = point;
        if (this.createdIds.length === 0) {
            this.createdLastPos = undefined;
        }
        else {
            let cmd = {
                kind: 'despawn',
                entities: [this.createdIds.pop()],
            };
            (0,_command_command__WEBPACK_IMPORTED_MODULE_17__.executeAndLogCommand)(this.sys.world, cmd);
        }
        this.recomputeCreatedLastPos();
    }
    recomputeCreatedLastPos() {
        if (this.createdIds.length === 0) {
            this.createdLastPos = undefined;
        }
        else {
            let id = this.createdIds[this.createdIds.length - 1];
            let wallPos = this.sys.world.getComponent(id, _component__WEBPACK_IMPORTED_MODULE_4__.POSITION_TYPE);
            let wall = this.sys.storage.getComponent(id);
            this.createdLastPos = [
                wallPos.x + wall.vec[0],
                wallPos.y + wall.vec[1],
            ];
        }
        this.redrawCreationLastLine(this.mouseLastPos);
    }
    onStart() {
        this.isActive = true;
        this.initCreation();
    }
    onPointerMove(event) {
        let point = (0,_tools_utils__WEBPACK_IMPORTED_MODULE_14__.getMapPointFromMouseInteraction)(this.sys.world, event);
        this.redrawCreationLastLine(point);
    }
    onPointerClick(event) {
        let point = (0,_tools_utils__WEBPACK_IMPORTED_MODULE_14__.getMapPointFromMouseInteraction)(this.sys.world, event);
        this.addVertex(point);
    }
    onPointerRightDown(event) {
        let point = (0,_tools_utils__WEBPACK_IMPORTED_MODULE_14__.getMapPointFromMouseInteraction)(this.sys.world, event);
        this.undoVertex(point);
    }
    onEnd() {
        this.endCreation();
        this.isActive = false;
    }
    initialize() {
        this.createLastLineDisplay.zIndex = _phase_editMap_displayPrecedence__WEBPACK_IMPORTED_MODULE_2__.DisplayPrecedence.WALL + 1;
        this.createLastLineDisplay.interactive = false;
        this.createLastLineDisplay.interactiveChildren = false;
        this.pixiBoardSys.board.addChild(this.createLastLineDisplay);
        this.pixiBoardSys.board.sortChildren();
    }
    destroy() {
        this.createLastLineDisplay.destroy(_util_pixi__WEBPACK_IMPORTED_MODULE_1__.DESTROY_ALL);
    }
}


/***/ }),

/***/ "./src/app/ecs/tools/inspect.ts":
/*!**************************************!*\
  !*** ./src/app/ecs/tools/inspect.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "InspectToolDriver": () => (/* binding */ InspectToolDriver)
/* harmony export */ });
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _systems_selectionSystem__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../systems/selectionSystem */ "./src/app/ecs/systems/selectionSystem.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "./src/app/ecs/tools/utils.ts");
/* harmony import */ var _toolType__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./toolType */ "./src/app/ecs/tools/toolType.ts");




class InspectToolDriver {
    constructor(world) {
        this.name = _toolType__WEBPACK_IMPORTED_MODULE_3__.Tool.INSPECT;
        this.justSelected = [];
        this.lastDownEntities = [];
        this.isDown = false;
        this.canMoveSelected = false;
        this.isMoving = false;
        this.movingStart = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Point();
        this.lastMove = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Point();
        this.world = world;
        this.selectionSys = world.systems.get(_systems_selectionSystem__WEBPACK_IMPORTED_MODULE_1__.SELECTION_TYPE);
    }
    onPointerClick(event) {
        let ctrlPressed = !!event.data.originalEvent.ctrlKey;
        let entities = this.lastDownEntities;
        if (entities.length === 0 && !ctrlPressed) {
            this.selectionSys.clear();
        }
        if (ctrlPressed && entities.length !== 0) {
            let toRemove = [];
            for (let entity of entities) {
                if (this.justSelected.indexOf(entity) !== -1)
                    return;
                toRemove.push(entity);
            }
            this.selectionSys.removeEntities(toRemove);
        }
    }
    onPointerDown(event) {
        this.isDown = true;
        this.justSelected.length = 0;
        let point = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getBoardPosFromOrigin)(this.world, event);
        let ctrlPressed = !!event.data.originalEvent.ctrlKey;
        let entities = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.findEntitiesAt)(this.world, point, ctrlPressed);
        this.lastDownEntities = entities;
        if (this.lastDownEntities.length !== 0) {
            // Clients can't move anything (TODO: this should be false)
            event.consumed || (event.consumed = this.world.isMaster);
            // event.consumed = true;
            if (!ctrlPressed) {
                this.selectionSys.setOnlyEntity(entities[0]);
            }
            else {
                let selected = this.selectionSys.selectedEntities;
                for (let entity of this.lastDownEntities) {
                    if (!selected.has(entity)) {
                        this.justSelected.push(entity);
                    }
                }
                this.selectionSys.addEntities(this.justSelected);
            }
            // TODO: better move system
            this.canMoveSelected = this.world.isMaster;
            if (!this.canMoveSelected)
                return;
            let point = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getMapPointFromMouseInteraction)(this.world, event);
            this.movingStart.copyFrom(point);
            this.lastMove.set(0, 0);
        }
    }
    onPointerUp(event) {
        this.isDown = false;
        if (this.isMoving) {
            this.isMoving = false;
            this.world.events.emit('tool_move_end');
        }
    }
    onPointerMove(event) {
        if (!this.isDown || !this.canMoveSelected || this.lastDownEntities.length === 0 || event.canBecomeClick)
            return;
        if (!this.isMoving) {
            this.isMoving = true;
            this.world.events.emit('tool_move_begin');
        }
        let point = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getMapPointFromMouseInteraction)(this.world, event);
        let diffX = point.x - this.movingStart.x;
        let diffY = point.y - this.movingStart.y;
        let moveX = diffX - this.lastMove.x;
        let moveY = diffY - this.lastMove.y;
        this.lastMove.set(diffX, diffY);
        this.selectionSys.moveAll(moveX, moveY);
    }
}


/***/ }),

/***/ "./src/app/ecs/tools/toolType.ts":
/*!***************************************!*\
  !*** ./src/app/ecs/tools/toolType.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Tool": () => (/* binding */ Tool)
/* harmony export */ });
var Tool;
(function (Tool) {
    Tool["INSPECT"] = "inspect";
    Tool["CREATE_WALL"] = "create_wall";
    Tool["CREATE_PIN"] = "create_pin";
    Tool["CREATE_PROP"] = "create_prop";
    Tool["GRID"] = "grid";
    Tool["LIGHT"] = "light";
    Tool["PROP_TELEPORT_LINK"] = "prop_teleport_link";
})(Tool || (Tool = {}));


/***/ }),

/***/ "./src/app/ecs/tools/utils.ts":
/*!************************************!*\
  !*** ./src/app/ecs/tools/utils.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "findEntitiesAt": () => (/* binding */ findEntitiesAt),
/* harmony export */   "getBoardPosFromOrigin": () => (/* binding */ getBoardPosFromOrigin),
/* harmony export */   "getMapPointFromMouseInteraction": () => (/* binding */ getMapPointFromMouseInteraction),
/* harmony export */   "createEmptyDriver": () => (/* binding */ createEmptyDriver)
/* harmony export */ });
/* harmony import */ var _interaction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../interaction */ "./src/app/ecs/interaction.ts");
/* harmony import */ var _systems_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../systems/pixiBoardSystem */ "./src/app/ecs/systems/pixiBoardSystem.ts");
/* harmony import */ var _systems_interactionSystem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../systems/interactionSystem */ "./src/app/ecs/systems/interactionSystem.ts");
/* harmony import */ var _systems_wallSystem__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../systems/wallSystem */ "./src/app/ecs/systems/wallSystem.ts");




function findEntitiesAt(world, point, multi) {
    let event = _interaction__WEBPACK_IMPORTED_MODULE_0__.QueryHitEvent.queryPoint(point, multi);
    world.events.emit('query_hit', event);
    return [...event.hits];
}
function getBoardPosFromOrigin(world, event, orig) {
    let board = world.systems.get(_systems_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_1__.PIXI_BOARD_TYPE);
    return event.data.getLocalPosition(board.board, orig);
}
function getMapPointFromMouseInteraction(world, event, orig) {
    let point = getBoardPosFromOrigin(world, event, orig);
    const interSys = world.systems.get(_systems_interactionSystem__WEBPACK_IMPORTED_MODULE_2__.INTERACTION_TYPE);
    let nearest = interSys.snapDb.findNearest([point.x, point.y]);
    if (nearest !== undefined && nearest[1] < 100) {
        point.set(nearest[0][0], nearest[0][1]);
    }
    else {
        const wallSys = world.systems.get(_systems_wallSystem__WEBPACK_IMPORTED_MODULE_3__.WALL_TYPE);
        let onWallLoc = wallSys === null || wallSys === void 0 ? void 0 : wallSys.findLocationOnWall(point, 50);
        if (onWallLoc !== undefined) {
            point.copyFrom(onWallLoc);
        }
    }
    return point;
}
function createEmptyDriver(name) {
    return new EmptyToolDriver(name);
}
class EmptyToolDriver {
    constructor(name) {
        this.name = name;
    }
}


/***/ }),

/***/ "./src/app/ecs/world.ts":
/*!******************************!*\
  !*** ./src/app/ecs/world.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "World": () => (/* binding */ World)
/* harmony export */ });
/* harmony import */ var _systemGraph__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./systemGraph */ "./src/app/ecs/systemGraph.ts");
/* harmony import */ var _util_safeEventEmitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/safeEventEmitter */ "./src/app/util/safeEventEmitter.ts");
/* harmony import */ var _ecsUtil__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ecsUtil */ "./src/app/ecs/ecsUtil.ts");
// Welcome to this talk, I'll present to you: my stupid version of ECS.
// What am I trying to solve?
// Everything in the map will need to hold information, this might be a player holding inventory or maybe a monster
// holding to lifepoints and such.
// What's more? every entity might have multiple names and only some of them might be public
// so we also have something similar to a "multiple component".



class World {
    constructor(isMaster) {
        this.systems = new _systemGraph__WEBPACK_IMPORTED_MODULE_0__.SystemGraph();
        this.storages = new Map();
        this.storageList = new Array();
        this.entities = new Set();
        this.resources = new Map();
        this.systemsFinalized = false;
        this.isDeserializing = false;
        //      Event list:
        // entity_spawn(id)
        // entity_spawned(id) - After an entity is spawned
        // entity_despawn(id)
        // entity_despawned(id) - After an entity is despawned
        // component_add(component)
        // component_edit(changes, component) - Before the component is edited
        // component_edited(component, changes) - After the component is edited
        // component_remove(component)
        // component_removed(component)
        // resource_add(resource)
        // resource_added(resource)
        // resource_edit(oldRes, newRes)
        // resource_remove(resource)
        // resource_removed(resource)
        // clear()
        // cleared()
        // serialize()
        // serialized(res)
        // serialize_entity(entity)
        // deserialize(data)
        // deserialized()
        //      External events:
        // query_hit(event: QueryHitEvent)
        // selection_begin(entities)
        // selection_end(entities)
        // selection_update()
        // tool_move_begin()
        // tool_move_end()
        //      TODO
        // batch_update_begin()
        // batch_update_end()
        this.events = new _util_safeEventEmitter__WEBPACK_IMPORTED_MODULE_1__.default();
        this.isMaster = isMaster;
    }
    getStorage(name) {
        let s = this.storages.get(name);
        if (s === undefined) {
            throw "Cannot find storage " + name;
        }
        return s;
    }
    allocateId() {
        let id = -1;
        do {
            id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        } while (this.entities.has(id));
        return id;
    }
    spawnEntity(...components) {
        let id = this.allocateId();
        this.spawnEntityManual(id, components);
        return id;
    }
    spawnEntityManual(id, components) {
        this.entities.add(id);
        this.events.emit('entity_spawn', id);
        for (let comp of components) {
            this.addComponent(id, comp);
        }
        this.events.emit('entity_spawned', id);
    }
    // TODO: deal with entity links
    respawnEntities(data) {
        for (let entity of data) {
            if (entity.id === -1) {
                entity.id = this.allocateId();
            }
            this.entities.add(entity.id);
            this.events.emit('entity_spawn', entity.id);
        }
        for (let entity of data) {
            for (let c of entity.components) {
                this.addComponent(entity.id, c);
            }
        }
        for (let entity of data) {
            this.events.emit('entity_spawned', entity.id);
        }
    }
    despawnEntitiesSave(entities) {
        let res = [];
        for (let entity of entities) {
            let comp = this.saveAllComponents(entity);
            res.push({
                id: entity,
                components: comp,
            });
        }
        for (let entity of entities) {
            this.despawnEntity(entity);
        }
        return res;
    }
    despawnEntity(entity) {
        this.events.emit('entity_despawn', entity);
        for (let i = this.storageList.length - 1; i >= 0; --i) {
            let storage = this.storageList[i];
            let comps = [...storage.getComponents(entity)];
            if (comps.length === 0)
                continue;
            for (let component of comps) {
                this.events.emit('component_remove', component);
            }
            storage.unregisterAllOf(entity);
            for (let component of comps) {
                this.events.emit('component_removed', component);
            }
        }
        this.entities.delete(entity);
        this.events.emit('entity_despawned', entity);
    }
    addSystem(system) {
        if (this.systemsFinalized)
            throw 'Too late to add a system';
        try {
            this.systems.register(system);
        }
        catch (e) {
            throw new Error("Error while mounting " + system.name + ": " + e);
        }
    }
    hasAllComponents(entity, ...types) {
        for (let t of types) {
            if (this.getComponent(entity, t) === undefined)
                return false;
        }
        return true;
    }
    addComponent(entity, cmp) {
        cmp.entity = entity;
        let storage = this.storages.get(cmp.type);
        if (storage === undefined) {
            throw 'Cannot register component of type ' + cmp.type + ', no storage found';
        }
        storage.register(cmp);
        this.events.emit('component_add', cmp);
    }
    removeComponent(cmp) {
        this.events.emit('component_remove', cmp);
        let storage = this.getStorage(cmp.type);
        storage.unregister(cmp);
        this.events.emit('component_removed', cmp);
    }
    removeComponentType(entity, type) {
        for (let c of this.getStorage(type).getComponents(entity)) {
            this.removeComponent(c);
        }
    }
    addStorage(storage) {
        this.storages.set(storage.type, storage);
        this.storageList.push(storage);
    }
    getComponent(entity, type, multiId) {
        let storage = this.getStorage(type);
        return storage.getFirstComponent(entity, multiId);
    }
    saveAllComponents(entity) {
        let res = new Array();
        for (let storage of this.storages.values()) {
            if (!storage.save)
                continue;
            res.push(...storage.getComponents(entity));
        }
        return res.map(_ecsUtil__WEBPACK_IMPORTED_MODULE_2__.filterComponent);
    }
    getAllComponents(entity) {
        let res = new Array();
        for (let storage of this.storages.values()) {
            res.push(...storage.getComponents(entity));
        }
        return res;
    }
    editComponent(entity, type, changes, multiId, clearCh = true) {
        let c = this.getComponent(entity, type, multiId);
        if (c === undefined) {
            throw 'Cannot find component ' + type + ' of entity: ' + entity;
        }
        if (clearCh && !clearChanges(c, changes))
            return; // No real changes
        this.events.emit('component_edit', c, changes);
        let changed = assignSwap(c, changes);
        this.events.emit('component_edited', c, changed);
    }
    editComponentMultiple(entity, changes) {
        if (changes.length === 0)
            return;
        if (changes.length === 1) {
            this.editComponent(entity, changes[0].type, changes[0].changes, changes[0].multiId, changes[0].clearChanges);
            return;
        }
        let chs = changes;
        for (let change of chs) {
            let c = this.getComponent(entity, change.type, change.multiId);
            if (c === undefined) {
                throw 'Cannot find component ' + change.type + ' of entity: ' + entity;
            }
            change._comp = c;
            if (change.clearChanges && !clearChanges(c, changes)) {
                change._skip = true;
            }
        }
        for (let change of chs) {
            if (change._skip)
                continue;
            this.events.emit('component_edit', change._comp, change.changes);
        }
        for (let change of chs) {
            if (change._skip)
                continue;
            assignSwap(change._comp, change.changes);
        }
        for (let change of chs) {
            if (change._skip)
                continue;
            this.events.emit('component_edited', change._comp, change.changes);
        }
    }
    addResource(resource, ifPresent = 'fail') {
        if (this.resources.has(resource.type)) {
            switch (ifPresent) {
                case 'ignore': break;
                case 'update':
                    this.editResource(resource.type, resource);
                    break;
                default: throw 'Resource type already present';
            }
            return;
        }
        this.events.emit('resource_add', resource);
        if (this.resources.has(resource.type))
            throw '"resource_add" event has added a resource of the same type!';
        this.resources.set(resource.type, resource);
        this.events.emit('resource_added', resource);
    }
    getResource(type) {
        return this.resources.get(type);
    }
    editResource(type, changes) {
        let res = this.getResource(type);
        if (res === undefined) {
            throw 'Cannot find resource ' + type;
        }
        if (!clearChanges(res, changes))
            return; // No real changes
        this.events.emit('resource_edit', res, changes);
        assignSwap(res, changes); // changes now has old values
        this.events.emit('resource_edited', res, changes);
    }
    removeResource(type, failIfNotPresent = true) {
        let resource = this.resources.get(type);
        if (resource === undefined) {
            if (failIfNotPresent)
                throw 'Resource type not found';
            return;
        }
        this.events.emit('resource_remove', resource);
        this.resources.delete(type);
        this.events.emit('resource_removed', resource);
    }
    enable() {
        for (let system of this.systems) {
            system.enable();
        }
    }
    destroy() {
        for (let i = this.systems.size() - 1; i >= 0; i--) {
            let system = this.systems.getAt(i);
            system.destroy();
        }
    }
    serialize() {
        this.events.emit('serialize', 'save');
        let storages = {};
        for (let storage of this.storages.values()) {
            if (!storage.save)
                continue;
            storages[storage.type] = storage.serialize();
        }
        let resources = {};
        for (let resource of this.resources.values()) {
            if (resource._save === false)
                continue; // undefined is treated as true so that loaded resources get saved again
            let res = {};
            for (let name in resource) {
                if (name[0] === '_' || name === 'type')
                    continue;
                res[name] = resource[name];
            }
            resources[resource.type] = res;
        }
        let res = {
            entities: [...this.entities],
            storages,
            resources,
        };
        this.events.emit('serialized', res);
        return res;
    }
    serializeClient() {
        this.events.emit('serialize', 'client');
        let storages = {};
        let hostHidden = this.getStorage('host_hidden');
        for (let storage of this.storages.values()) {
            if (!storage.save || !storage.sync)
                continue;
            storages[storage.type] = storage.serializeClient((e) => hostHidden.getFirstComponent(e) !== undefined);
        }
        let resources = {};
        for (let resource of this.resources.values()) {
            if (resource._save === false || resource._sync === false)
                continue;
            let res = {};
            for (let name in resource) {
                if (name[0] === '_' || name === 'type')
                    continue;
                res[name] = resource[name];
            }
            resources[resource.type] = res;
        }
        let res = {
            entities: [...this.entities].filter((e) => hostHidden.getFirstComponent(e) === undefined),
            storages,
            resources,
        };
        this.events.emit('serialized', res);
        return res;
    }
    deserialize(data) {
        this.clear();
        this.isDeserializing = true;
        this.events.emit('deserialize', data);
        for (let type in data.resources) {
            let res = data.resources[type];
            res.type = type;
            this.addResource(res, 'update');
        }
        for (let entity of data.entities) {
            this.entities.add(entity);
            this.events.emit('entity_spawn', entity);
        }
        for (let type in data.storages) {
            let storage = this.storages.get(type);
            if (storage === undefined) {
                console.error("Cannot deserialize storage type: " + type + ", ignoring");
                continue;
            }
            storage.deserialize(this, data.storages[type]);
        }
        for (let entity of data.entities) {
            this.events.emit('entity_spawned', entity);
        }
        this.isDeserializing = false;
        this.events.emit('deserialized');
    }
    clear() {
        this.events.emit('clear');
        for (let entity of [...this.entities]) {
            this.despawnEntity(entity);
        }
        // Round 2 (if some entity gets spawned on despawn)
        for (let entity of [...this.entities]) {
            this.despawnEntity(entity);
        }
        if (this.entities.size !== 0)
            throw 'Entities spawned while clearing!';
        this.events.emit('cleared');
    }
    /**
     * TODO: use Vue 3
     * Overrides the `Object.prototype.toString.call(obj)` result.
     * This is done to hide this object and its children from observers (see https://github.com/vuejs/vue/issues/2637)
     * @returns {string} - type name
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag}
     */
    get [Symbol.toStringTag]() {
        // Anything can go here really as long as it's not 'Object'
        return 'ObjectNoObserve';
    }
}
function assignSwap(obj, changes) {
    for (let name in changes) {
        let tmp = changes[name];
        changes[name] = obj[name];
        obj[name] = tmp;
    }
    return changes;
}
function clearChanges(from, changes) {
    let changec = 0;
    for (let change in changes) {
        if (from[change] === changes[change]) {
            delete changes[change];
        }
        else {
            changec++;
        }
    }
    return changec !== 0;
}


/***/ }),

/***/ "./src/app/game/grid.ts":
/*!******************************!*\
  !*** ./src/app/game/grid.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GridType": () => (/* binding */ GridType),
/* harmony export */   "STANDARD_GRID_OPTIONS": () => (/* binding */ STANDARD_GRID_OPTIONS)
/* harmony export */ });
var GridType;
(function (GridType) {
    GridType[GridType["SQUARE"] = 0] = "SQUARE";
    GridType[GridType["HEXAGON"] = 1] = "HEXAGON";
})(GridType || (GridType = {}));
const STANDARD_GRID_OPTIONS = {
    visible: true,
    gridType: GridType.SQUARE,
    color: 0,
    thick: 10,
    opacity: 0.75,
    size: 128,
    offX: 0,
    offY: 0,
};


/***/ }),

/***/ "./src/app/game/pointDB.ts":
/*!*********************************!*\
  !*** ./src/app/game/pointDB.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PointDB": () => (/* binding */ PointDB)
/* harmony export */ });
/* harmony import */ var _util_k2dTree__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/k2dTree */ "./src/app/util/k2dTree.ts");
/* harmony import */ var _util_geometry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/geometry */ "./src/app/util/geometry.ts");


class PointDB {
    constructor(grid) {
        // In js we cannot create a Map with a custom object as key -_-
        this.counter = new Map();
        this.tree = new _util_k2dTree__WEBPACK_IMPORTED_MODULE_0__.K2dTree();
        this.count = 0;
        this.grid = grid;
    }
    insert(point) {
        let ptrStr = point[0] + '|' + point[1];
        let p = this.counter.get(ptrStr) || 0;
        this.counter.set(ptrStr, p + 1);
        if (p == 0) {
            this.tree.insert(point);
        }
        this.count++;
    }
    remove(point) {
        let ptrStr = point[0] + '|' + point[1];
        let p = (this.counter.get(ptrStr) || 0) - 1;
        if (p == 0) {
            this.counter.delete(ptrStr);
            if (!this.tree.remove(point)) {
                console.error('Failed to remove node: ' + point);
            }
        }
        else if (p > 0) {
            this.counter.set(ptrStr, p);
        }
        else {
            return false;
        }
        this.count--;
        return true;
    }
    findNearest(point) {
        let treeNearest = this.tree.nearestPoint(point);
        let gridNearest = undefined;
        if (this.grid !== undefined) {
            gridNearest = this.grid.closestPoint(point);
        }
        if (gridNearest !== undefined) {
            let gridDist = (0,_util_geometry__WEBPACK_IMPORTED_MODULE_1__.distSquared2d)(point[0], point[1], gridNearest[0], gridNearest[1]);
            if (treeNearest === undefined || gridDist < treeNearest[1]) {
                return [gridNearest, gridDist];
            }
        }
        return treeNearest;
    }
}


/***/ }),

/***/ "./src/app/game/pointLightRenderer.ts":
/*!********************************************!*\
  !*** ./src/app/game/pointLightRenderer.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setup": () => (/* binding */ setup),
/* harmony export */   "createMesh": () => (/* binding */ createMesh),
/* harmony export */   "updateMeshPolygons": () => (/* binding */ updateMeshPolygons),
/* harmony export */   "updateMeshUniforms": () => (/* binding */ updateMeshUniforms)
/* harmony export */ });
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../PIXI */ "./src/app/PIXI.ts");

var hex2rgb = _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.utils.hex2rgb;
// Other methods: https://github.com/mattdesl/lwjgl-basics/wiki/2D-Pixel-Perfect-Shadows
const LIGHT_VERTEX_SHADER = `
    precision mediump float;
    attribute vec2 aVertexPosition;
    
    varying vec2 vecPos;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    void main() {
        vecPos = aVertexPosition;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
`;
const LIGHT_FRAGMENT_SHADER = `
    precision mediump float;

    varying vec2 vecPos;
    
    uniform vec2 center;
    uniform float radSquared;
    uniform vec3 color;

    void main() {
        vec2 diff = center - vecPos;
        float distSq = diff.x * diff.x + diff.y * diff.y;
        float intensity = 1.0 - clamp(distSq / radSquared, 0., 1.);
        gl_FragColor = vec4(color, 1) * (intensity * intensity);// Pre multiplied alpha
    }
`;
const CONST_LIGHT_FRAGMENT_SHADER = `
    precision mediump float;

    varying vec2 vecPos;
    
    uniform vec2 center;
    uniform float radSquared;
    uniform vec3 color;

    void main() {
        vec2 diff = center - vecPos;
        float distSq = diff.x * diff.x + diff.y * diff.y;
        float intensity = float(distSq <= radSquared);
        gl_FragColor = vec4(color, 1) * intensity;// Pre multiplied alpha
    }
`;
const PLAYER_VIS_FRAGMENT_SHADER = `
    precision mediump float;

    varying vec2 vecPos;
    
    uniform vec2 center;
    uniform float radSquared;
    uniform vec3 color;

    void main() {
        vec2 diff = center - vecPos;
        float distSq = diff.x * diff.x + diff.y * diff.y;
        float intensity = 1.0 - smoothstep(0.9, 1.0, clamp(distSq / radSquared, 0., 1.));
        gl_FragColor = vec4(color, 1) * intensity;// Pre multiplied alpha
    }
`;
let lightProgram = undefined;
let constLightProgram = undefined;
let playerVisProgram = undefined;
function setup() {
    if (lightProgram === undefined) {
        lightProgram = _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Program.from(LIGHT_VERTEX_SHADER, LIGHT_FRAGMENT_SHADER);
        constLightProgram = _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Program.from(LIGHT_VERTEX_SHADER, CONST_LIGHT_FRAGMENT_SHADER);
        playerVisProgram = _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Program.from(LIGHT_VERTEX_SHADER, PLAYER_VIS_FRAGMENT_SHADER);
    }
}
function createMesh(lightType = 'normal') {
    let geometry = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Geometry();
    let buff = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Buffer(new Float32Array(1));
    geometry.addAttribute('aVertexPosition', buff, 2, false, _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.TYPES.FLOAT);
    let program;
    switch (lightType) {
        case 'normal':
            program = lightProgram;
            break;
        case 'const':
            program = constLightProgram;
            break;
        case 'player':
            program = playerVisProgram;
            break;
    }
    // We'll change them all, in due time
    let shaders = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Shader(program, {
        'center': new Float32Array([0.5, 0.5]),
        'radSquared': 10,
        'color': new Float32Array([0, 0, 0]),
    });
    let mesh = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Mesh(geometry, shaders, undefined, _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.DRAW_MODES.TRIANGLE_FAN);
    mesh.interactive = false;
    mesh.interactiveChildren = false;
    return mesh;
}
function updateMeshPolygons(mesh, pos, poly) {
    let buffer = mesh.geometry.getBuffer('aVertexPosition');
    let fBuffer = new Float32Array(poly.length + 4);
    fBuffer[0] = pos.x;
    fBuffer[1] = pos.y;
    fBuffer.set(poly, 2);
    fBuffer[poly.length + 2] = poly[0];
    fBuffer[poly.length + 3] = poly[1];
    buffer.update(fBuffer);
}
function updateMeshUniforms(mesh, center, rangeSquared, color) {
    let uni = mesh.shader.uniforms;
    let c = uni.center;
    c[0] = center.x;
    c[1] = center.y;
    uni.radSquared = rangeSquared;
    hex2rgb(color, uni.color);
}


/***/ }),

/***/ "./src/app/geometry/aabb.ts":
/*!**********************************!*\
  !*** ./src/app/geometry/aabb.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Aabb": () => (/* binding */ Aabb)
/* harmony export */ });
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../PIXI */ "./src/app/PIXI.ts");

class Aabb {
    constructor(x1, y1, x2, y2) {
        if (x1 > x2)
            [x1, x2] = [x2, x1];
        if (y1 > y2)
            [y1, y2] = [y2, y1];
        this.minX = x1;
        this.minY = y1;
        this.maxX = x2;
        this.maxY = y2;
    }
    isValid() {
        return this.minX < this.maxX && this.minY < this.maxY;
    }
    getCenter() {
        return new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Point((this.minX + this.maxX) / 2, (this.minY + this.maxY) / 2);
    }
    getPerimeter() {
        return (this.maxX - this.minX + this.maxY - this.minY) * 2;
    }
    translate(x, y, target) {
        target.minX = this.minX + x;
        target.minY = this.minY + y;
        target.maxX = this.maxX + x;
        target.maxY = this.maxY + y;
    }
    combine(other, target) {
        target.minX = Math.min(this.minX, other.minX);
        target.minY = Math.min(this.minY, other.minY);
        target.maxX = Math.max(this.maxX, other.maxX);
        target.maxY = Math.max(this.maxY, other.maxY);
    }
    intersect(other, target) {
        target.minX = Math.max(this.minX, other.minX);
        target.minY = Math.max(this.minY, other.minY);
        target.maxX = Math.min(this.maxX, other.maxX);
        target.maxY = Math.min(this.maxY, other.maxY);
    }
    extend(amount, target) {
        target.minX = this.minX - amount;
        target.minY = this.minY - amount;
        target.maxX = this.maxX - amount;
        target.maxY = this.maxY - amount;
    }
    scale(dx, dy, target) {
        let cx = (this.minX + this.maxX) / 2;
        let cy = (this.minY + this.maxY) / 2;
        let hw = (this.maxX - this.minX) / 2;
        let hh = (this.maxY - this.minY) / 2;
        target.minX = cx - hw * dx;
        target.minY = cy - hh * dy;
        target.maxX = cx + hw * dx;
        target.maxY = cy + hh * dy;
    }
    copyFrom(other) {
        this.minX = other.minX;
        this.minY = other.minY;
        this.maxX = other.maxX;
        this.maxY = other.maxY;
    }
    reset() {
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
    }
    wrapPolygon(polygon) {
        this.minX = Number.POSITIVE_INFINITY;
        this.minY = Number.POSITIVE_INFINITY;
        this.maxX = Number.NEGATIVE_INFINITY;
        this.maxY = Number.NEGATIVE_INFINITY;
        let len = polygon.length;
        for (let i = 0; i < len; i += 2) {
            this.minX = Math.min(this.minX, polygon[i]);
            this.minY = Math.min(this.minY, polygon[i + 1]);
            this.maxX = Math.max(this.maxX, polygon[i]);
            this.maxY = Math.max(this.maxY, polygon[i + 1]);
        }
    }
    copy() {
        let other = Aabb.zero();
        other.copyFrom(this);
        return other;
    }
    toString() {
        return "AABB(" + this.minX.toFixed(2) + ", " + this.minY.toFixed(2) + ", " + this.maxX.toFixed(2) + ", " + this.maxY.toFixed(2) + ")";
    }
    static zero() {
        return new Aabb(0, 0, 0, 0);
    }
    static fromBounds(b) {
        return new Aabb(b.left, b.top, b.right, b.bottom);
    }
    static fromPoint(p) {
        return new Aabb(p.x, p.y, p.x, p.y);
    }
    static fromPointAnchor(pos, size, anchor) {
        return new Aabb(pos.x - size.x * anchor.x, pos.y - size.y * anchor.y, pos.x + size.x * (1 - anchor.x), pos.y + size.y * (1 - anchor.y));
    }
}


/***/ }),

/***/ "./src/app/geometry/collision.ts":
/*!***************************************!*\
  !*** ./src/app/geometry/collision.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "overlapAabbVsAabb": () => (/* binding */ overlapAabbVsAabb),
/* harmony export */   "containsAabbVsAabb": () => (/* binding */ containsAabbVsAabb),
/* harmony export */   "overlapAabbVsPoint": () => (/* binding */ overlapAabbVsPoint),
/* harmony export */   "overlapAabbVsLine": () => (/* binding */ overlapAabbVsLine),
/* harmony export */   "overlapPointVsCircle": () => (/* binding */ overlapPointVsCircle),
/* harmony export */   "overlapCircleVsAabb": () => (/* binding */ overlapCircleVsAabb),
/* harmony export */   "overlapCircleVsCircle": () => (/* binding */ overlapCircleVsCircle),
/* harmony export */   "overlapCircleVsPolygon": () => (/* binding */ overlapCircleVsPolygon),
/* harmony export */   "overlapObbVsPolygon": () => (/* binding */ overlapObbVsPolygon),
/* harmony export */   "overlapLineVsPolygon": () => (/* binding */ overlapLineVsPolygon),
/* harmony export */   "rotatePointByOrig": () => (/* binding */ rotatePointByOrig),
/* harmony export */   "overlapRotatedRectVsPoint": () => (/* binding */ overlapRotatedRectVsPoint),
/* harmony export */   "overlapRotatedRectVsCircle": () => (/* binding */ overlapRotatedRectVsCircle),
/* harmony export */   "overlapRotatedRectVsLine": () => (/* binding */ overlapRotatedRectVsLine),
/* harmony export */   "computeObbPoints": () => (/* binding */ computeObbPoints),
/* harmony export */   "overlapRotatedRectVsAabb": () => (/* binding */ overlapRotatedRectVsAabb),
/* harmony export */   "overlapRotatedRectVsRotatedRect": () => (/* binding */ overlapRotatedRectVsRotatedRect),
/* harmony export */   "overlapLineVsCircle": () => (/* binding */ overlapLineVsCircle),
/* harmony export */   "SegmentVsSegmentRes": () => (/* binding */ SegmentVsSegmentRes),
/* harmony export */   "intersectSegmentVsSegment": () => (/* binding */ intersectSegmentVsSegment),
/* harmony export */   "triangleContainsPoint": () => (/* binding */ triangleContainsPoint),
/* harmony export */   "lineSameSlope": () => (/* binding */ lineSameSlope)
/* harmony export */ });
/* harmony import */ var _aabb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./aabb */ "./src/app/geometry/aabb.ts");
/* harmony import */ var _line__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./line */ "./src/app/geometry/line.ts");
/* harmony import */ var _visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./visibilityPolygon */ "./src/app/geometry/visibilityPolygon.ts");
/* harmony import */ var _util_geometry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/geometry */ "./src/app/util/geometry.ts");
/* harmony import */ var _obb__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./obb */ "./src/app/geometry/obb.ts");
/* provided dependency */ var PIXI = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/pixi.es.js");





function overlapAabbVsAabb(a, b) {
    return a.minX <= b.maxX && a.maxX >= b.minX &&
        a.minY <= b.maxY && a.maxY >= b.minY;
}
function containsAabbVsAabb(a, b) {
    return a.minX <= b.minX && a.maxX >= b.maxX &&
        a.minY <= b.minY && a.maxY >= b.maxY;
}
function overlapAabbVsPoint(a, b) {
    return a.minX <= b.x && a.minY <= b.y &&
        a.maxX >= b.x && a.maxY >= b.y;
}
const INSIDE = 0;
const LEFT = 1;
const RIGHT = 2;
const BOTTOM = 4;
const TOP = 8;
function computeOutCode(box, x, y) {
    let code = INSIDE;
    if (x < box.minX)
        code |= LEFT;
    else if (x > box.maxX)
        code |= RIGHT;
    if (y < box.minY)
        code |= BOTTOM;
    else if (y > box.maxY)
        code |= TOP;
    return code;
}
function overlapAabbVsLine(a, b) {
    let fc = computeOutCode(a, b.fromX, b.fromY);
    let tc = computeOutCode(a, b.toX, b.toY);
    // Fast paths:
    // One of the points is inside
    if (fc === INSIDE || tc === INSIDE)
        return true;
    // bitwise AND is not 0: both points share an outside zone (LEFT, RIGHT, TOP,
    // or BOTTOM), so both must be outside window
    if ((fc & tc) !== 0)
        return false;
    // Both points are in directly opposite sites (left/right or top/bottom)
    if ((fc | tc) === (LEFT | RIGHT))
        return true;
    if ((fc | tc) === (TOP | BOTTOM))
        return true;
    return intersectSegmentVsSegment(new _line__WEBPACK_IMPORTED_MODULE_1__.Line(a.minX, a.minY, a.minX, a.maxY), b) === SegmentVsSegmentRes.INTERN ||
        intersectSegmentVsSegment(new _line__WEBPACK_IMPORTED_MODULE_1__.Line(a.minX, a.maxY, a.maxX, a.maxY), b) === SegmentVsSegmentRes.INTERN ||
        intersectSegmentVsSegment(new _line__WEBPACK_IMPORTED_MODULE_1__.Line(a.maxX, a.maxY, a.maxX, a.minY), b) === SegmentVsSegmentRes.INTERN ||
        intersectSegmentVsSegment(new _line__WEBPACK_IMPORTED_MODULE_1__.Line(a.maxX, a.minY, a.minX, a.minY), b) === SegmentVsSegmentRes.INTERN;
}
function overlapPointVsCircle(point, center, radius) {
    return (0,_util_geometry__WEBPACK_IMPORTED_MODULE_3__.distSquared2d)(point.x, point.y, center.x, center.y) < radius * radius;
}
function overlapCircleVsAabb(center, radius, aabb) {
    let distX = Math.abs(center.x - (aabb.minX + aabb.maxX) / 2);
    let distY = Math.abs(center.y - (aabb.minY + aabb.maxY) / 2);
    let halfW = (aabb.maxX - aabb.minX) / 2;
    let halfH = (aabb.maxY - aabb.minY) / 2;
    if (distX > halfW + radius)
        return false;
    if (distY > halfH + radius)
        return false;
    if (distX < halfW || distY < halfH)
        return true;
    let dx = distX - halfW;
    let dy = distY - halfH;
    return dx * dx + dy * dy <= radius * radius;
}
function overlapCircleVsCircle(ac, ar, bc, br) {
    let dx = ac.x - bc.x;
    let dy = ac.y - bc.y;
    let r = ar + br;
    return dx * dx + dy * dy < r * r;
}
function overlapCircleVsPolygon(ac, ar, poly) {
    if ((0,_util_geometry__WEBPACK_IMPORTED_MODULE_3__.polygonPointIntersect)(ac, poly))
        return true;
    let tmpLine = new _line__WEBPACK_IMPORTED_MODULE_1__.Line(0, 0, 0, 0);
    let tmpPoint = new PIXI.Point();
    let r2 = ar * ar;
    for (let i = 2; i < poly.length; i += 2) {
        tmpLine.fromX = poly[i - 2];
        tmpLine.fromY = poly[i - 1];
        tmpLine.toX = poly[i];
        tmpLine.toY = poly[i + 1];
        tmpLine.projectPoint(ac, tmpPoint, true);
        if ((0,_util_geometry__WEBPACK_IMPORTED_MODULE_3__.distSquared2d)(tmpPoint.x, tmpPoint.y, ac.x, ac.y) <= r2) {
            return true;
        }
    }
    return false;
}
function overlapObbVsPolygon(obb, poly) {
    let polyAabb = _aabb__WEBPACK_IMPORTED_MODULE_0__.Aabb.zero();
    polyAabb.wrapPolygon(poly);
    // Fast path
    if (!overlapRotatedRectVsAabb(obb, polyAabb))
        return false;
    for (let i = 0; i < 8; i += 2) {
        let p = {
            x: obb.rotVertex[i],
            y: obb.rotVertex[i + 1],
        };
        // If a point of the OBB is inside the polygon then we're done
        if ((0,_util_geometry__WEBPACK_IMPORTED_MODULE_3__.polygonPointIntersect)(p, poly))
            return true;
    }
    for (let i = 0; i < poly.length; i += 2) {
        let p = {
            x: poly[i],
            y: poly[i + 1],
        };
        // If a point of the polygon is inside the OBB then we're done
        if (overlapRotatedRectVsPoint(obb, p))
            return true;
    }
    let obbLines = [
        [0, 2],
        [2, 4],
        [4, 6],
        [6, 0]
    ];
    // Check line intersections
    for (let line of obbLines) {
        let obbLine = new _line__WEBPACK_IMPORTED_MODULE_1__.Line(obb.rotVertex[line[0]], obb.rotVertex[line[0] + 1], obb.rotVertex[line[1]], obb.rotVertex[line[1] + 1]);
        if (overlapLineVsPolygon(obbLine, poly))
            return true;
    }
    return false;
}
function overlapLineVsPolygon(line, poly) {
    let totLines = poly.length - 2;
    for (let i = 0; i < totLines; i += 2) {
        let polLine = new _line__WEBPACK_IMPORTED_MODULE_1__.Line(poly[i], poly[i + 1], poly[i + 2], poly[i + 3]);
        if (intersectSegmentVsSegment(line, polLine) == SegmentVsSegmentRes.INTERN)
            return true;
    }
    let polLine = new _line__WEBPACK_IMPORTED_MODULE_1__.Line(poly[0], poly[1], poly[poly.length - 2], poly[poly.length - 1]);
    return intersectSegmentVsSegment(line, polLine) == SegmentVsSegmentRes.INTERN;
}
function rotatePointByOrig(o, rot, p) {
    let s = Math.sin(-rot);
    let c = Math.cos(-rot);
    let transX = p.x - o.x;
    let transY = p.y - o.y;
    return new PIXI.Point((transX * c - transY * s) + o.x, (transX * s + transY * c) + o.y);
}
function overlapRotatedRectVsPoint(obb, p) {
    let rotatedPoint = rotatePointByOrig(obb.unrotated.getCenter(), obb.rotation, p);
    return overlapAabbVsPoint(obb.unrotated, rotatedPoint);
}
function overlapRotatedRectVsCircle(obb, pos, rad) {
    let rotatedPoint = rotatePointByOrig(obb.unrotated.getCenter(), obb.rotation, pos);
    return overlapCircleVsAabb(rotatedPoint, rad, obb.unrotated);
}
function overlapRotatedRectVsLine(obb, line) {
    let center = obb.unrotated.getCenter();
    let rotFrom = rotatePointByOrig(center, obb.rotation, { x: line.fromX, y: line.fromY });
    let rotTo = rotatePointByOrig(center, obb.rotation, { x: line.toX, y: line.toY });
    return overlapAabbVsLine(obb.unrotated, new _line__WEBPACK_IMPORTED_MODULE_1__.Line(rotFrom.x, rotFrom.y, rotTo.x, rotTo.y));
}
function computeObbPoints(aabb, rot, origin) {
    let res = new Array(8);
    let o = origin || {
        x: (aabb.minX + aabb.maxX) / 2,
        y: (aabb.minY + aabb.maxY) / 2,
    };
    for (let i = 0; i < 4; i++) {
        let minX = (i & 1);
        let minY = (i & 2) >>> 1;
        let p = rotatePointByOrig(o, rot, {
            x: minX ? aabb.minX : aabb.maxX,
            y: minY ? aabb.minY : aabb.maxY,
        });
        res[i * 2] = p.x;
        res[i * 2 + 1] = p.y;
    }
    return res;
}
function overlapRotatedRectVsAabb(obb, aabb) {
    // Separating Axis Theorem
    let otherAabb = _aabb__WEBPACK_IMPORTED_MODULE_0__.Aabb.zero();
    otherAabb.wrapPolygon(obb.rotVertex);
    if (overlapAabbVsAabb(aabb, otherAabb))
        return true;
    // Apply the inverse transform of the obb to the aabb
    let originalInv = computeObbPoints(aabb, obb.rotation, obb.unrotated.getCenter());
    otherAabb.reset();
    otherAabb.wrapPolygon(originalInv);
    return overlapAabbVsAabb(obb.unrotated, otherAabb);
}
function overlapRotatedRectVsRotatedRect(obb1, obb2) {
    let center = obb2.unrotated.getCenter();
    let res = obb2.unrotated.copy();
    res.translate(-center.x, -center.y, res);
    let obb3 = _obb__WEBPACK_IMPORTED_MODULE_4__.Obb.rotateAabb(res, obb2.rotation - obb1.rotation);
    return overlapRotatedRectVsAabb(obb3, obb1.unrotated);
}
function overlapLineVsCircle(line, point, radius) {
    let tmpPoint = new PIXI.Point();
    if (!line.projectPoint(point, tmpPoint, true)) {
        return false;
    }
    let dist = (0,_util_geometry__WEBPACK_IMPORTED_MODULE_3__.distSquared2d)(tmpPoint.x, tmpPoint.y, point.x, point.y);
    return dist < radius * radius;
}
var SegmentVsSegmentRes;
(function (SegmentVsSegmentRes) {
    SegmentVsSegmentRes[SegmentVsSegmentRes["NONE"] = 0] = "NONE";
    SegmentVsSegmentRes[SegmentVsSegmentRes["INTERN"] = 1] = "INTERN";
    SegmentVsSegmentRes[SegmentVsSegmentRes["EDGE_A"] = 2] = "EDGE_A";
    SegmentVsSegmentRes[SegmentVsSegmentRes["EDGE_B"] = 4] = "EDGE_B";
})(SegmentVsSegmentRes || (SegmentVsSegmentRes = {}));
function intersectSegmentVsSegment(a, b, target) {
    let den = (b.toY - b.fromY) * (a.toX - a.fromX) -
        (b.toX - b.fromX) * (a.toY - a.fromY);
    if (den === 0)
        return SegmentVsSegmentRes.NONE; // Parallel (or coincident)
    const s = ((b.toX - b.fromX) * (a.fromY - b.fromY) -
        (b.toY - b.fromY) * (a.fromX - b.fromX)) / den;
    if (s < -_visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__.EPSILON || s > 1 + _visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__.EPSILON)
        return SegmentVsSegmentRes.NONE;
    const u = ((a.toX - a.fromX) * (a.fromY - b.fromY) -
        (a.toY - a.fromY) * (a.fromX - b.fromX)) / den;
    if (u < -_visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__.EPSILON || u > 1 + _visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__.EPSILON)
        return SegmentVsSegmentRes.NONE;
    if (target !== undefined) {
        target.set(a.fromX + s * (a.toX - a.fromX), a.fromY + s * (a.toY - a.fromY));
    }
    let edge = 0;
    if (s < _visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__.EPSILON || s > 1 - _visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__.EPSILON)
        edge |= SegmentVsSegmentRes.EDGE_A;
    if (u < _visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__.EPSILON || u > 1 - _visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__.EPSILON)
        edge |= SegmentVsSegmentRes.EDGE_B;
    return edge === 0 ? SegmentVsSegmentRes.INTERN : edge;
}
function triangleContainsPoint(p, p0, p1, p2) {
    let A = 1 / 2 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
    let sign = A < 0 ? -1 : 1;
    let s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
    let t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;
    return s - _visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__.EPSILON > 0 && t - _visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__.EPSILON > 0 && (s + t) < 2 * A * sign - _visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__.EPSILON;
}
function lineSameSlope(ax, ay, bx, by) {
    // We need to remove divisions, (this is not real code)
    // ay / ax == by / bx  ==> ay * bx == by * ax
    return Math.abs(ay * bx - by * ax) < _visibilityPolygon__WEBPACK_IMPORTED_MODULE_2__.EPSILON;
}


/***/ }),

/***/ "./src/app/geometry/dynamicTree.ts":
/*!*****************************************!*\
  !*** ./src/app/geometry/dynamicTree.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DynamicTree": () => (/* binding */ DynamicTree)
/* harmony export */ });
/* harmony import */ var _aabb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./aabb */ "./src/app/geometry/aabb.ts");
/* harmony import */ var _collision__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./collision */ "./src/app/geometry/collision.ts");
// A version highly inspired by plank.js (https://github.com/shakiba/planck.js/blob/f5777884f537db97608d8016bda960d251d42d4d/lib/collision/DynamicTree.js)


class TreeNode {
    constructor(id) {
        this.aabb = _aabb__WEBPACK_IMPORTED_MODULE_0__.Aabb.zero();
        this.height = -1;
        this.id = id;
    }
    toString() {
        return this.id + ": " + this.tag;
    }
    isLeaf() {
        return this.left === undefined;
    }
}
class DynamicTree {
    constructor(aabbExtension = 0.1, aabbMultiplier = 2) {
        this.nodes = new Map();
        this.lastProxyId = 0;
        this.aabbExtension = aabbExtension;
        this.aabbMultiplier = aabbMultiplier;
    }
    getTag(id) {
        var _a;
        return (_a = this.nodes.get(id)) === null || _a === void 0 ? void 0 : _a.tag;
    }
    setTag(id, tag) {
        this.nodes.get(id).tag = tag;
    }
    getFatAabb(id) {
        var _a;
        return (_a = this.nodes.get(id)) === null || _a === void 0 ? void 0 : _a.aabb;
    }
    allocateNode() {
        let node = new TreeNode(++this.lastProxyId);
        this.nodes.set(node.id, node);
        return node;
    }
    freeNode(node) {
        this.nodes.delete(node.id);
    }
    createProxy(aabb, tag) {
        let node = this.allocateNode();
        node.aabb.copyFrom(aabb);
        // Fatten the aabb
        node.aabb.extend(this.aabbExtension, node.aabb);
        node.tag = tag;
        node.height = 0;
        this.insertLeaf(node);
        return node.id;
    }
    destroyProxy(id) {
        let node = this.nodes.get(id);
        this.removeLeaf(node);
        this.freeNode(node);
    }
    moveProxy(id, aabb, d) {
        let node = this.nodes.get(id);
        if ((0,_collision__WEBPACK_IMPORTED_MODULE_1__.containsAabbVsAabb)(node.aabb, aabb)) {
            return false;
        }
        this.removeLeaf(node);
        node.aabb.copyFrom(aabb);
        // Fatten
        node.aabb.extend(this.aabbExtension, node.aabb);
        // Predict motion
        if (this.aabbMultiplier !== 1) {
            if (d.x < 0)
                aabb.minX += d.x * this.aabbMultiplier;
            else
                aabb.maxX += d.x * this.aabbMultiplier;
            if (d.y < 0)
                aabb.minY += d.y * this.aabbMultiplier;
            else
                aabb.maxY += d.y * this.aabbMultiplier;
        }
        this.insertLeaf(node);
        return true;
    }
    insertLeaf(leaf) {
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
            let combinedAabb = _aabb__WEBPACK_IMPORTED_MODULE_0__.Aabb.zero();
            index.aabb.combine(leafAabb, combinedAabb);
            let combinedPer = combinedAabb.getPerimeter();
            let cost = combinedPer * 2;
            let inheritanceCost = (combinedPer - per) * 2;
            let costLeft;
            if (left.isLeaf()) {
                left.aabb.combine(leafAabb, combinedAabb);
                costLeft = combinedAabb.getPerimeter() + inheritanceCost;
            }
            else {
                left.aabb.combine(leafAabb, combinedAabb);
                let oldPerimeter = left.aabb.getPerimeter();
                let newPerimeter = combinedAabb.getPerimeter();
                costLeft = (newPerimeter - oldPerimeter) + inheritanceCost;
            }
            let costRight;
            if (right.isLeaf()) {
                right.aabb.combine(leafAabb, combinedAabb);
                costRight = combinedAabb.getPerimeter() + inheritanceCost;
            }
            else {
                right.aabb.combine(leafAabb, combinedAabb);
                let oldPerimeter = right.aabb.getPerimeter();
                let newPerimeter = combinedAabb.getPerimeter();
                costRight = (newPerimeter - oldPerimeter) + inheritanceCost;
            }
            if (cost < costLeft && cost < costRight) {
                break;
            }
            if (costLeft < costRight)
                index = left;
            else
                index = right;
        }
        let sibling = index;
        let oldParent = sibling.parent;
        let newParent = this.allocateNode();
        newParent.parent = oldParent;
        sibling.aabb.combine(leafAabb, newParent.aabb);
        newParent.height = sibling.height + 1;
        if (oldParent !== undefined) {
            // The sibling was not the root
            if (oldParent.left === sibling)
                oldParent.left = newParent;
            else
                oldParent.right = newParent;
        }
        else {
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
    removeLeaf(leaf) {
        if (leaf === this.root) {
            this.root = undefined;
            return;
        }
        let parent = leaf.parent;
        let grandParent = parent.parent;
        let sibling;
        if (parent.left === leaf)
            sibling = parent.right;
        else
            sibling = parent.left;
        if (grandParent !== undefined) {
            // Destroy parent and connect sibling to grandParent
            if (grandParent.left === parent)
                grandParent.left = sibling;
            else
                grandParent.right = sibling;
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
        }
        else {
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
    balance(current) {
        let a = current;
        if (a.isLeaf() || a.height < 2)
            return a;
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
                if (c.parent.left === a)
                    c.parent.left = c;
                else
                    c.parent.right = c;
            }
            else {
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
            }
            else {
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
                if (b.parent.left === a)
                    b.parent.left = b;
                else
                    b.parent.right = b;
            }
            else {
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
            }
            else {
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
    *query(aabb) {
        let stack = new Array();
        if (this.root === undefined)
            return;
        //console.log("Starting query: " + aabb.toString());
        stack.push(this.root);
        while (stack.length > 0) {
            let node = stack.pop();
            let overlap = (0,_collision__WEBPACK_IMPORTED_MODULE_1__.overlapAabbVsAabb)(node.aabb, aabb);
            //console.log("Visit: " + node.id + " = " + overlap);
            if (!overlap)
                continue;
            if (node.isLeaf()) {
                yield node;
            }
            else {
                stack.push(node.left);
                stack.push(node.right);
            }
        }
    }
}


/***/ }),

/***/ "./src/app/geometry/line.ts":
/*!**********************************!*\
  !*** ./src/app/geometry/line.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Line": () => (/* binding */ Line)
/* harmony export */ });
class Line {
    constructor(fx, fy, tx, ty) {
        this.fromX = fx;
        this.fromY = fy;
        this.toX = tx;
        this.toY = ty;
    }
    distance() {
        let dx = this.toX - this.fromX;
        let dy = this.toY - this.fromY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    distanceSquared() {
        let dx = this.toX - this.fromX;
        let dy = this.toY - this.fromY;
        return dx * dx + dy * dy;
    }
    projectPoint(p, target, ignoreValid = false) {
        if (this.fromX === this.toX && this.fromY === this.toY)
            return false;
        let u = ((p.x - this.fromX) * (this.toX - this.fromX)) +
            ((p.y - this.fromY) * (this.toY - this.fromY));
        let udenom = this.distanceSquared();
        u /= udenom;
        let rx = this.fromX + u * (this.toX - this.fromX);
        let ry = this.fromY + u * (this.toY - this.fromY);
        if (ignoreValid) {
            target.set(rx, ry);
            return true;
        }
        let minx = this.fromX, maxx = this.toX;
        let miny = this.fromY, maxy = this.toY;
        if (minx > maxx)
            [minx, maxx] = [maxx, minx];
        if (miny > maxy)
            [miny, maxy] = [maxy, miny];
        let isValid = (rx >= minx && rx <= maxx) && (ry >= miny && ry <= maxy);
        if (isValid) {
            target.set(rx, ry);
            return true;
        }
        else {
            return false;
        }
    }
    copy() {
        return new Line(this.fromX, this.fromY, this.toX, this.toY);
    }
}


/***/ }),

/***/ "./src/app/geometry/obb.ts":
/*!*********************************!*\
  !*** ./src/app/geometry/obb.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Obb": () => (/* binding */ Obb)
/* harmony export */ });
/* harmony import */ var _collision__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./collision */ "./src/app/geometry/collision.ts");

class Obb {
    constructor(unrotated, rotation, rotVertex) {
        this.unrotated = unrotated;
        this.rotation = rotation;
        this.rotVertex = rotVertex;
    }
    recompute() {
        this.rotVertex = (0,_collision__WEBPACK_IMPORTED_MODULE_0__.computeObbPoints)(this.unrotated, this.rotation);
    }
    copy() {
        return new Obb(this.unrotated.copy(), this.rotation, [...this.rotVertex]);
    }
    static rotateAabb(aabb, rot) {
        if (rot === 0)
            return this.fromAabb(aabb);
        return new Obb(aabb, rot, (0,_collision__WEBPACK_IMPORTED_MODULE_0__.computeObbPoints)(aabb, rot));
    }
    static fromAabb(aabb) {
        let points = [
            aabb.minX, aabb.minY,
            aabb.minX, aabb.maxY,
            aabb.maxX, aabb.maxY,
            aabb.maxX, aabb.minY
        ];
        return new Obb(aabb, 0, points);
    }
}


/***/ }),

/***/ "./src/app/geometry/visibilityPolygon.ts":
/*!***********************************************!*\
  !*** ./src/app/geometry/visibilityPolygon.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EPSILON": () => (/* binding */ EPSILON),
/* harmony export */   "compute": () => (/* binding */ compute),
/* harmony export */   "computeViewport": () => (/* binding */ computeViewport)
/* harmony export */ });
/* harmony import */ var _line__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./line */ "./src/app/geometry/line.ts");
/* harmony import */ var _collision__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./collision */ "./src/app/geometry/collision.ts");
/* harmony import */ var _util_geometry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/geometry */ "./src/app/util/geometry.ts");
/* harmony import */ var _util_binaryHeap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/binaryHeap */ "./src/app/util/binaryHeap.ts");
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../PIXI */ "./src/app/PIXI.ts");





const EPSILON = 0.0000001;
class EndPoint extends _PIXI__WEBPACK_IMPORTED_MODULE_4__.default.Point {
    constructor() {
        super(...arguments);
        this.angle = 0;
        this.dist = 0;
    }
}
class Segment {
    constructor(f, t) {
        this.from = f;
        this.to = t;
        this.used = false;
    }
}
// a < b
function segmentLt(a, b, o) {
    // *opens philosophy book*
    // But what does it mean for a segment to be less than another one? (relative to a point)
    // There are multiple algorithms for this, the one that makes most sense to me is what I call the
    // triangular intersection:
    // Given two segments a, b and a point o we define a < b == true only if there is at least one point in b that
    // is hidden by a.
    // For every segment then the property a < b => !(b < a) is maintained only if the segments do not intersect
    // (as the only way that two lines would hide each other is if they meet in a point).
    // On another note, the property a < b, b < c => a < c is not maintained!
    // How can this be computed, then?
    // a.from is inside the triangle formed by b and o, this means:
    // - a.to is also inside, then a < b
    // - a.to is outside, then a < b
    if ((0,_collision__WEBPACK_IMPORTED_MODULE_1__.triangleContainsPoint)(a.from, b.from, b.to, o))
        return true;
    if ((0,_collision__WEBPACK_IMPORTED_MODULE_1__.triangleContainsPoint)(a.to, b.from, b.to, o))
        return true;
    // If we arrive here we can be sure that neither points of a is inside the triangle,
    // A segment with both points outside of the triangle can intersect it only by intersecting two of the three
    // lines. We already assume that a and b cannot intersect so we can check either (b.from, o) or (b.to, o) and see
    // if it intersects with a
    let c1 = (0,_collision__WEBPACK_IMPORTED_MODULE_1__.intersectSegmentVsSegment)(new _line__WEBPACK_IMPORTED_MODULE_0__.Line(b.from.x, b.from.y, o.x, o.y), new _line__WEBPACK_IMPORTED_MODULE_0__.Line(a.from.x, a.from.y, a.to.x, a.to.y));
    if (c1 === _collision__WEBPACK_IMPORTED_MODULE_1__.SegmentVsSegmentRes.INTERN)
        return true;
    let c2 = (0,_collision__WEBPACK_IMPORTED_MODULE_1__.intersectSegmentVsSegment)(new _line__WEBPACK_IMPORTED_MODULE_0__.Line(b.to.x, b.to.y, o.x, o.y), new _line__WEBPACK_IMPORTED_MODULE_0__.Line(a.from.x, a.from.y, a.to.x, a.to.y));
    if (c2 === _collision__WEBPACK_IMPORTED_MODULE_1__.SegmentVsSegmentRes.INTERN)
        return true;
    // Edge case: one of the end points of the second line (the segment a) lies
    // in the line (b.from, o), this might mean two things:
    // 1: the line shares a point but does not block the second segment's view
    // 2: the line shares a point and the other point blocks the whole view (hitting the other triangle line)
    // we want to check the second case, so let's try the second segment intersect
    if ((c1 & _collision__WEBPACK_IMPORTED_MODULE_1__.SegmentVsSegmentRes.EDGE_B) !== 0 && c2 !== _collision__WEBPACK_IMPORTED_MODULE_1__.SegmentVsSegmentRes.NONE) {
        return true;
    }
    if ((c2 & _collision__WEBPACK_IMPORTED_MODULE_1__.SegmentVsSegmentRes.EDGE_B) !== 0 && c1 !== _collision__WEBPACK_IMPORTED_MODULE_1__.SegmentVsSegmentRes.NONE) {
        return true;
    }
    // Edge case n.2 (I'm kinda hating on grids)
    // The segment a could lay a point on the line between (b.from/to, o) and the other in b
    // Edge case of the edge case: If the segment is in any of the endpoints of b then it does not occlude the view
    if (((c1 | c2) & (_collision__WEBPACK_IMPORTED_MODULE_1__.SegmentVsSegmentRes.EDGE_B | _collision__WEBPACK_IMPORTED_MODULE_1__.SegmentVsSegmentRes.EDGE_A)) === _collision__WEBPACK_IMPORTED_MODULE_1__.SegmentVsSegmentRes.EDGE_B) {
        let c3 = (0,_collision__WEBPACK_IMPORTED_MODULE_1__.intersectSegmentVsSegment)(new _line__WEBPACK_IMPORTED_MODULE_0__.Line(b.from.x, b.from.y, b.to.x, b.to.y), new _line__WEBPACK_IMPORTED_MODULE_0__.Line(a.from.x, a.from.y, a.to.x, a.to.y));
        if (c3 !== _collision__WEBPACK_IMPORTED_MODULE_1__.SegmentVsSegmentRes.NONE)
            return true;
    }
    // This means a >= b
    return false;
}
function initSegment(x1, y1, x2, y2, pos) {
    let a = new EndPoint(x1, y1);
    let b = new EndPoint(x2, y2);
    a.angle = Math.atan2(pos.y - a.y, pos.x - a.x);
    b.angle = Math.atan2(pos.y - b.y, pos.x - b.x);
    a.dist = (0,_util_geometry__WEBPACK_IMPORTED_MODULE_2__.distSquared2d)(pos.x, pos.y, a.x, a.y);
    b.dist = (0,_util_geometry__WEBPACK_IMPORTED_MODULE_2__.distSquared2d)(pos.x, pos.y, b.x, b.y);
    let s = new Segment(a, b);
    a.segment = s;
    b.segment = s;
    return s;
}
function compute0(pos, segments) {
    let points = new Array();
    for (let s of segments) {
        points.push(s.from, s.to);
    }
    // O(Nlog(N))
    points.sort((a, b) => {
        return a.angle - b.angle;
    });
    let segmentPriorityQueue = new _util_binaryHeap__WEBPACK_IMPORTED_MODULE_3__.BinaryHeap((a, b) => segmentLt(a, b, pos));
    // Populate the priority queue O(Nlog(N))
    // The priority queue should already have all the segment it collides with, but do not fear as
    // the math is quite simple and straightforward:
    // We should check that the segment collides with the line that starts at pos and has angle = -Math.PI.
    // To do that we can just check the angles of the two endpoints (draw it in a piece of paper, it's easier if shown).
    for (let segment of segments) {
        let fa = segment.from.angle;
        let ta = segment.to.angle;
        let isActive = false;
        isActive || (isActive = fa <= 0 && ta >= 0 && ta - fa > Math.PI);
        isActive || (isActive = ta <= 0 && fa >= 0 && fa - ta > Math.PI);
        if (isActive)
            segmentPriorityQueue.push(segment);
    }
    let polygon = new Array();
    for (let i = 0; i < points.length;) {
        // Extend signals that the first segment has ended
        // we should then extend the polygon to the new first visible segment.
        let extend = false;
        let orig = i; // The original point index
        let vertex = points[i];
        let oldSegment = segmentPriorityQueue.peek();
        do {
            let currSegment = points[i].segment;
            if (segmentPriorityQueue.hasElem(currSegment)) {
                if (currSegment === oldSegment) {
                    extend = true;
                    vertex = points[i];
                }
                segmentPriorityQueue.popElem(currSegment);
            }
            else {
                segmentPriorityQueue.push(currSegment);
            }
            i++;
            if (i === points.length)
                break;
        } while (points[i].angle < points[orig].angle + EPSILON);
        segmentPriorityQueue.peek().used = true;
        if (extend) {
            // Vertex is the first point of the old segment, we need to push this right away
            polygon.push(vertex.x, vertex.y);
            let point = new _PIXI__WEBPACK_IMPORTED_MODULE_4__.default.Point();
            let firstSeg = segmentPriorityQueue.peek();
            (0,_util_geometry__WEBPACK_IMPORTED_MODULE_2__.intersectLineVsLine)(firstSeg.from, firstSeg.to, pos, vertex, point);
            if (!(Math.abs(point.x - vertex.x) < EPSILON && Math.abs(point.y - vertex.y) < EPSILON)) {
                polygon.push(point.x, point.y);
            }
        }
        else if (segmentPriorityQueue.peek() != oldSegment) {
            // A new segment has hidden the old first segment.
            // First compute where the old segment has been hidden, and push that point to the polygon
            let point = new _PIXI__WEBPACK_IMPORTED_MODULE_4__.default.Point();
            (0,_util_geometry__WEBPACK_IMPORTED_MODULE_2__.intersectLineVsLine)(oldSegment.from, oldSegment.to, pos, vertex, point);
            polygon.push(point.x, point.y);
            // Then compute where the new segment intersects
            let newClosest = segmentPriorityQueue.peek();
            let nPoint;
            if (Math.abs(newClosest.from.angle - points[orig].angle) < EPSILON) {
                nPoint = newClosest.from;
            }
            else {
                nPoint = newClosest.to;
            }
            if (!(Math.abs(point.x - nPoint.x) < EPSILON && Math.abs(point.y - nPoint.y) < EPSILON)) {
                polygon.push(nPoint.x, nPoint.y);
            }
        }
    }
    return polygon;
}
function compute(pos, inSegments) {
    let segments = new Array(inSegments.length);
    // O(N)
    for (let segment of inSegments) {
        let s = initSegment(segment.fromX, segment.fromY, segment.toX, segment.toY, pos);
        segments.push(s);
    }
    return compute0(pos, segments);
}
const INSIDE = 0;
const LEFT = 1;
const RIGHT = 2;
const BOTTOM = 4;
const TOP = 8;
function computeOutCode(box, x, y) {
    let code = INSIDE;
    if (x < box.minX)
        code |= LEFT;
    else if (x > box.maxX)
        code |= RIGHT;
    if (y < box.minY)
        code |= BOTTOM;
    else if (y > box.maxY)
        code |= TOP;
    return code;
}
function clipSegment(line, aabb, light) {
    // https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm
    let x0 = line.fromX;
    let y0 = line.fromY;
    let x1 = line.toX;
    let y1 = line.toY;
    let code0 = computeOutCode(aabb, x0, y0);
    let code1 = computeOutCode(aabb, x1, y1);
    while (true) {
        if ((code0 | code1) === 0) {
            // bitwise OR is 0: both points inside window; trivially accept and exit loop
            return initSegment(x0, y0, x1, y1, light);
        }
        else if ((code0 & code1) !== 0) {
            // failed both tests, so calculate the line segment to clip
            // from an outside point to an intersection with clip edge
            return undefined;
        }
        else {
            let x = 0, y = 0;
            // At least one endpoint is outside the clip rectangle; pick it.
            let codeOut = code1 > code0 ? code1 : code0;
            // Now find the intersection point;
            // use formulas:
            //   slope = (y1 - y0) / (x1 - x0)
            //   x = x0 + (1 / slope) * (ym - y0), where ym is ymin or ymax
            //   y = y0 + slope * (xm - x0), where xm is xmin or xmax
            // No need to worry about divide-by-zero because, in each case, the
            // outcode bit being tested guarantees the denominator is non-zero
            if ((codeOut & TOP) !== 0) { // point is above the clip window
                x = x0 + (x1 - x0) * (aabb.maxY - y0) / (y1 - y0);
                y = aabb.maxY;
            }
            else if ((codeOut & BOTTOM) !== 0) { // point is below the clip window
                x = x0 + (x1 - x0) * (aabb.minY - y0) / (y1 - y0);
                y = aabb.minY;
            }
            else if ((codeOut & RIGHT) !== 0) { // point is to the right of clip window
                y = y0 + (y1 - y0) * (aabb.maxX - x0) / (x1 - x0);
                x = aabb.maxX;
            }
            else if ((codeOut & LEFT) !== 0) { // point is to the left of clip window
                y = y0 + (y1 - y0) * (aabb.minX - x0) / (x1 - x0);
                x = aabb.minX;
            }
            // Now we move outside point to intersection point to clip
            // and get ready for next pass.
            let code = computeOutCode(aabb, x, y);
            if (codeOut === code0) {
                x0 = x;
                y0 = y;
                code0 = code;
            }
            else {
                x1 = x;
                y1 = y;
                code1 = code;
            }
        }
    }
}
function computeViewport(lines, aabb, light, usedLines) {
    //console.log("Lines: " + lines.length);
    let segments = new Array();
    let lineLen = lines.length;
    for (let i = 0; i < lineLen; i++) {
        let segment = clipSegment(lines[i], aabb, light);
        if (segment !== undefined) {
            segment.index = i;
            segments.push(segment);
        }
    }
    //console.log("Done");
    // Push viewport segments:
    segments.push(initSegment(aabb.minX, aabb.minY, aabb.minX, aabb.maxY, light), initSegment(aabb.minX, aabb.maxY, aabb.maxX, aabb.maxY, light), initSegment(aabb.maxX, aabb.maxY, aabb.maxX, aabb.minY, light), initSegment(aabb.maxX, aabb.minY, aabb.minX, aabb.minY, light));
    //console.log("SEGMENTS: ", segments);
    let poly = compute0(light, segments);
    if (usedLines !== undefined) {
        // Compute what lines have been used
        let segLen = segments.length - 4;
        for (let i = 0; i < segLen; i++) {
            let s = segments[i];
            if (s.used)
                usedLines.push(s.index);
        }
    }
    return poly;
}


/***/ }),

/***/ "./src/app/graphics.ts":
/*!*****************************!*\
  !*** ./src/app/graphics.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE": () => (/* binding */ EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE),
/* harmony export */   "GRAPHIC_TYPE": () => (/* binding */ GRAPHIC_TYPE),
/* harmony export */   "ElementType": () => (/* binding */ ElementType),
/* harmony export */   "VisibilityType": () => (/* binding */ VisibilityType),
/* harmony export */   "ImageScaleMode": () => (/* binding */ ImageScaleMode)
/* harmony export */ });
// Common info about the graphical systems, this should be a semi-abstraction.
// NONE OF THIS SHOULD BE SERIALIZED! THIS IS ALL RUNTIME DEPENDANT! DETAILS WILL CHANGE BETWEEN MINOR VERSIONS!
const EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE = 'remember_bit_by_bit_vis_update';
const GRAPHIC_TYPE = "graphic";
var ElementType;
(function (ElementType) {
    ElementType[ElementType["CONTAINER"] = 0] = "CONTAINER";
    ElementType[ElementType["IMAGE"] = 1] = "IMAGE";
    ElementType[ElementType["LINE"] = 2] = "LINE";
    ElementType[ElementType["POINT"] = 3] = "POINT";
    ElementType[ElementType["TEXT"] = 4] = "TEXT";
})(ElementType || (ElementType = {}));
var VisibilityType;
(function (VisibilityType) {
    // You only see one thing when you see it! seems stupid but you can also remember things
    VisibilityType[VisibilityType["NORMAL"] = 0] = "NORMAL";
    // A player can always see itself, even with no light, "I think therefore I am"
    VisibilityType[VisibilityType["ALWAYS_VISIBLE"] = 1] = "ALWAYS_VISIBLE";
    // You'll remember once you see it
    VisibilityType[VisibilityType["REMEMBER"] = 2] = "REMEMBER";
    // Used in images, you only remember what you see! (only support images for now)
    VisibilityType[VisibilityType["REMEMBER_BIT_BY_BIT"] = 3] = "REMEMBER_BIT_BY_BIT";
})(VisibilityType || (VisibilityType = {}));
var ImageScaleMode;
(function (ImageScaleMode) {
    // 1 pixel = 1*scale pixels
    ImageScaleMode[ImageScaleMode["REAL"] = 0] = "REAL";
    // 1 pixel = 1*gridSize*scale pixels
    ImageScaleMode[ImageScaleMode["GRID"] = 1] = "GRID";
})(ImageScaleMode || (ImageScaleMode = {}));


/***/ }),

/***/ "./src/app/index.ts":
/*!**************************!*\
  !*** ./src/app/index.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "windowEventEmitter": () => (/* binding */ windowEventEmitter),
/* harmony export */   "app": () => (/* binding */ app),
/* harmony export */   "stage": () => (/* binding */ stage)
/* harmony export */ });
/* harmony import */ var _phase_stage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./phase/stage */ "./src/app/phase/stage.ts");
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _phase_homePhase__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./phase/homePhase */ "./src/app/phase/homePhase.ts");
/* harmony import */ var _util_eventEmitterWrapper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util/eventEmitterWrapper */ "./src/app/util/eventEmitterWrapper.ts");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.esm.js");
/* harmony import */ var bootstrap_vue__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! bootstrap-vue */ "./node_modules/bootstrap-vue/esm/index.js");
/* harmony import */ var _fortawesome_fontawesome_free_css_all_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @fortawesome/fontawesome-free/css/all.css */ "./node_modules/@fortawesome/fontawesome-free/css/all.css");
/* harmony import */ var _fortawesome_fontawesome_free_css_all_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_fontawesome_free_css_all_css__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _fortawesome_fontawesome_free_js_all_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @fortawesome/fontawesome-free/js/all.js */ "./node_modules/@fortawesome/fontawesome-free/js/all.js");
/* harmony import */ var _fortawesome_fontawesome_free_js_all_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_fontawesome_free_js_all_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var Public_style_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! Public/style.css */ "./src/public/style.css");
/* harmony import */ var Public_style_css__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(Public_style_css__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _phase_editMap_clientEditMapPhase__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./phase/editMap/clientEditMapPhase */ "./src/app/phase/editMap/clientEditMapPhase.ts");
/* harmony import */ var _util_pixi__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./util/pixi */ "./src/app/util/pixi.ts");
/* harmony import */ var _assetsLoader__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./assetsLoader */ "./src/app/assetsLoader.ts");
/* harmony import */ var _phase_loadingPhase__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./phase/loadingPhase */ "./src/app/phase/loadingPhase.ts");
/* harmony import */ var _ecs_systems_lightSystem__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./ecs/systems/lightSystem */ "./src/app/ecs/systems/lightSystem.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};








vue__WEBPACK_IMPORTED_MODULE_6__.default.use(bootstrap_vue__WEBPACK_IMPORTED_MODULE_7__.BootstrapVue);
// ================================================================================================ Public






const windowEventEmitter = new _util_eventEmitterWrapper__WEBPACK_IMPORTED_MODULE_3__.EventEmitterWrapper((event, emitter) => {
    window.addEventListener(event, data => {
        emitter.emit(event, data);
    });
});
// PIXI
let app;
// Main
const stage = new _phase_stage__WEBPACK_IMPORTED_MODULE_0__.Stage("main");
function onHashCahnge() {
    if (window.location.hash) {
        const roomId = window.location.hash.substr(1); // Remove #
        if (roomId.startsWith('p')) {
            console.log("Connecting with: peerj2");
            stage.setPhase(new _phase_editMap_clientEditMapPhase__WEBPACK_IMPORTED_MODULE_9__.ClientEditMapPhase(roomId.substr(1)));
        }
        else {
            console.log("Invalid hash");
            stage.setPhase(new _phase_homePhase__WEBPACK_IMPORTED_MODULE_2__.HomePhase());
        }
    }
    else {
        stage.setPhase(new _phase_homePhase__WEBPACK_IMPORTED_MODULE_2__.HomePhase());
    }
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Loading dndme: " + "636a0d7");
        // We cannot work without webgl
        _PIXI__WEBPACK_IMPORTED_MODULE_1__.default.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;
        app = new _PIXI__WEBPACK_IMPORTED_MODULE_1__.default.Application();
        (0,_util_pixi__WEBPACK_IMPORTED_MODULE_10__.addCustomBlendModes)();
        app.renderer.backgroundColor = _ecs_systems_lightSystem__WEBPACK_IMPORTED_MODULE_13__.DEFAULT_BACKGROUND;
        // The app.view (canvas) is only appended when the game-phase starts.
        app.view.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        stage.setPhase(new _phase_loadingPhase__WEBPACK_IMPORTED_MODULE_12__.LoadingPhase());
        yield (0,_assetsLoader__WEBPACK_IMPORTED_MODULE_11__.loadAssets)();
        onHashCahnge();
        window.onhashchange = function (e) {
            console.log("Hash change" + e.newURL);
            onHashCahnge();
        };
    });
})();


/***/ }),

/***/ "./src/app/map/gameMap.ts":
/*!********************************!*\
  !*** ./src/app/map/gameMap.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GameMap": () => (/* binding */ GameMap)
/* harmony export */ });
/* harmony import */ var _mapLevel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mapLevel */ "./src/app/map/mapLevel.ts");
/* harmony import */ var _msgpack_msgpack__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @msgpack/msgpack */ "./node_modules/@msgpack/msgpack/dist.es5+esm/encode.mjs");
/* harmony import */ var _msgpack_msgpack__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @msgpack/msgpack */ "./node_modules/@msgpack/msgpack/dist.es5+esm/decode.mjs");
/* harmony import */ var jszip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jszip */ "./node_modules/jszip/dist/jszip.min.js");
/* harmony import */ var jszip__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jszip__WEBPACK_IMPORTED_MODULE_1__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



class GameMap {
    constructor() {
        this.levels = new Map();
    }
    createDataJson() {
        let levels = {};
        for (let [id, level] of this.levels.entries()) {
            levels[id] = level.serialize();
        }
        let data = {
            version: GameMap.SER_VERSION,
            levels: levels,
        };
        return (0,_msgpack_msgpack__WEBPACK_IMPORTED_MODULE_2__.encode)(data);
    }
    saveToFile() {
        let data = this.createDataJson();
        let zip = new (jszip__WEBPACK_IMPORTED_MODULE_1___default())();
        zip.file("data.msgpack", data);
        return zip.generateAsync({
            type: "blob",
            compression: 'DEFLATE',
            // Prevent the browser from renaming the extension
            mimeType: 'application/octet-stream',
        });
    }
    static loadFromFile(from) {
        return __awaiter(this, void 0, void 0, function* () {
            let zip = yield jszip__WEBPACK_IMPORTED_MODULE_1___default().loadAsync(from);
            // TODO: better error management
            let file = yield zip.file("data.msgpack").async('arraybuffer');
            let data = yield (0,_msgpack_msgpack__WEBPACK_IMPORTED_MODULE_3__.decode)(file);
            if (data['version'] !== this.SER_VERSION) {
                throw 'Version not supported';
            }
            let gameMap = new GameMap();
            let levelsData = data["levels"];
            for (let id in levelsData) {
                let level = levelsData[id];
                let res = yield _mapLevel__WEBPACK_IMPORTED_MODULE_0__.MapLevel.deserialize(parseInt(id), level);
                gameMap.levels.set(res.id, res);
            }
            return gameMap;
        });
    }
}
GameMap.SER_VERSION = '1.0';


/***/ }),

/***/ "./src/app/map/mapLevel.ts":
/*!*********************************!*\
  !*** ./src/app/map/mapLevel.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MapLevel": () => (/* binding */ MapLevel)
/* harmony export */ });
class MapLevel {
    constructor(id) {
        this.id = id;
    }
    loadInto(ecs) {
        ecs.clear();
        if (this.ecs !== undefined) {
            ecs.deserialize(this.ecs);
        }
    }
    saveFrom(ecs) {
        this.ecs = undefined;
        this.ecs = ecs.serialize();
    }
    serialize() {
        return {
            name: this.name,
            ecs: this.ecs
        };
    }
    static deserialize(id, data) {
        let res = new MapLevel(id);
        res.name = data['name'];
        res.ecs = data['ecs'];
        return res;
    }
}


/***/ }),

/***/ "./src/app/network/channel.ts":
/*!************************************!*\
  !*** ./src/app/network/channel.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Channel": () => (/* binding */ Channel)
/* harmony export */ });
/* harmony import */ var eventemitter3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! eventemitter3 */ "./node_modules/eventemitter3/index.js");
/* harmony import */ var eventemitter3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(eventemitter3__WEBPACK_IMPORTED_MODULE_0__);

class Channel {
    constructor(isHost) {
        this.connections = [];
        this.connectionsById = new Map();
        this.myId = -1;
        this.nextBroadcastPacketId = 0;
        this.eventEmitter = new eventemitter3__WEBPACK_IMPORTED_MODULE_0__();
        this.bufferingChannels = 0;
        this.isHost = isHost;
        if (this.isHost) {
            this.myId = 0;
        }
    }
    onMessage(raw, conn) {
        //console.log("onMessage", raw);
        let packet = raw; // Check for errors?
        if (this.isHost) {
            packet.sender = conn.channelId;
        }
        if (packet.payload.type.startsWith("_")) {
            console.error("Invalid payload type");
            return;
        }
        // TODO: think of a better packetid system, we have some problems with
        //       host forwarding as the id changes, we can not have replies.
        if (this.isHost && packet.receiver !== this.myId) {
            let originalId = packet.id;
            if (packet.receiver === undefined) {
                packet.id = this.nextBroadcastPacketId++;
                for (let c of this.connectionsById.values()) {
                    if (c !== conn) {
                        c.send(packet);
                    }
                }
            }
            else {
                let recv = this.connectionsById.get(packet.receiver);
                if (recv === undefined) {
                    this.send({
                        type: "error",
                        errorType: "unknown_receiver",
                        requestId: packet.id,
                    }, conn.channelId);
                    return;
                }
                packet.id = recv.nextPacketId++;
                recv.send(packet);
            }
            packet.id = originalId;
        }
        if (packet.receiver === undefined || packet.receiver === this.myId) {
            let packetType = packet.payload.type;
            if (false) {}
            this.eventEmitter.emit("any", packet.payload, packet);
            this.eventEmitter.emit(packetType, packet.payload, packet);
        }
    }
    broadcast(packet) {
        const wrapped = {
            id: this.nextBroadcastPacketId,
            payload: packet,
            sender: this.myId,
        };
        if (false) {}
        for (let conn of this.connectionsById.values()) {
            conn.send(wrapped);
        }
        this.nextBroadcastPacketId++;
    }
    send(packet, receiverId) {
        const wrapped = {
            id: 0,
            payload: packet,
            sender: this.myId,
        };
        if (this.isHost) {
            let conn = this.connectionsById.get(receiverId);
            if (conn === undefined) {
                throw "Unknown receiver";
            }
            wrapped.id = conn.channelId++;
            conn.send(wrapped);
        }
        else {
            wrapped.id = this.nextBroadcastPacketId++;
            for (let conn of this.connectionsById.values()) {
                conn.send(wrapped);
            }
        }
        if (false) {}
    }
    onConnectionStatusUpdate(isBuffering) {
        if (isBuffering)
            this.bufferingChannels += 1;
        else
            this.bufferingChannels -= 1;
        this.eventEmitter.emit("_buffering_update", this.bufferingChannels);
    }
    registerNewConnection(conn) {
        this.connectionsById.set(conn.channelId, conn);
        this.connections.push(conn);
        conn.ondata = this.onMessage.bind(this);
        conn.nextPacketId = 0;
        conn.onBufferChange = this.onConnectionStatusUpdate.bind(this);
        this.eventEmitter.emit("_device_join", conn.channelId);
    }
    removeConnection(conn) {
        this.connectionsById.delete(conn.channelId);
        const index = this.connections.indexOf(conn);
        if (index > -1) {
            this.connections.splice(index, 1);
        }
        this.eventEmitter.emit("_device_left", conn.channelId);
    }
}


/***/ }),

/***/ "./src/app/network/networkManager.ts":
/*!*******************************************!*\
  !*** ./src/app/network/networkManager.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NetworkManager": () => (/* binding */ NetworkManager),
/* harmony export */   "NetworkConnection": () => (/* binding */ NetworkConnection)
/* harmony export */ });
/* harmony import */ var peerjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! peerjs */ "./node_modules/peerjs/dist/peerjs.min.js");
/* harmony import */ var peerjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(peerjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _channel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./channel */ "./src/app/network/channel.ts");
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../PIXI */ "./src/app/PIXI.ts");



var EventEmitter = _PIXI__WEBPACK_IMPORTED_MODULE_2__.default.utils.EventEmitter;
class NetworkManager extends EventEmitter {
    constructor(isHost) {
        super();
        this.myId = -1;
        // Used if is host:
        this.connections = new Map();
        this.nextConnectionId = 1;
        this.isHost = isHost;
        this.channel = new _channel__WEBPACK_IMPORTED_MODULE_1__.Channel(isHost);
        this.peer = new (peerjs__WEBPACK_IMPORTED_MODULE_0___default())(undefined, {
            host: 'peerjs.92k.de',
            secure: true,
            debug: 2
        });
        if (this.isHost) {
            this.myId = 0;
        }
        this.peer.on('connection', this.onConnection.bind(this));
        this.peer.on('open', this.onPeerConnectionOpen.bind(this));
        this.peer.on('error', this.onPeerConnectionError.bind(this));
    }
    onConnection(conn) {
        let id = 0;
        if (this.isHost) {
            id = this.nextConnectionId++;
        }
        let c = new NetworkConnection(this, id, conn);
        if (this.isHost) {
            this.connections.set(id, c);
        }
        else {
            this.hostConnection = c;
        }
    }
    onPeerConnectionOpen() {
        if (this.connectId !== undefined) {
            this.connectReady();
        }
        this.emit('ready');
    }
    onPeerConnectionError(err) {
        this.emit('error', err);
    }
    getId() {
        return this.peer.id;
    }
    connectTo(id) {
        if (this.isHost) {
            throw 'A host cannot open a connection, for now!';
        }
        if (this.connectId !== undefined) {
            throw 'Cannot connect to multiple hosts';
        }
        this.connectId = id;
        if (this.peer.id != null) {
            this.connectReady();
        }
    }
    disconnect() {
        this.connectId = undefined;
        this.peer.destroy();
    }
    connectReady() {
        if (this.connectId === undefined)
            return;
        let conn = this.peer.connect(this.connectId, {
            reliable: true,
        });
        this.hostConnection = new NetworkConnection(this, undefined, conn);
    }
}
class NetworkConnection {
    constructor(parent, chId, connection) {
        this.nextPacketId = -1;
        this.bootstrap = false;
        this.buffered = false;
        this.parent = parent;
        this.channelId = chId || 0;
        this.connection = connection;
        if (parent.isHost) {
            this.bootstrap = true;
        }
        connection.on('open', this.onOpen.bind(this));
        connection.on('data', this.onData.bind(this));
        connection.on('close', this.onClose.bind(this));
    }
    onOpen() {
        this.connection.dataChannel.onbufferedamountlow = this.updateBuffered.bind(this);
        if (this.parent.isHost) {
            this.connection.send(this.channelId);
            this.parent.channel.registerNewConnection(this);
        }
    }
    onData(data) {
        if (!this.bootstrap) {
            this.parent.myId = data;
            this.parent.channel.myId = data;
            this.bootstrap = true;
            this.parent.channel.registerNewConnection(this);
            return;
        }
        else if (this.ondata !== undefined) {
            this.ondata(data, this);
        }
    }
    onClose() {
        this.parent.channel.removeConnection(this);
    }
    send(data) {
        this.connection.send(data);
        this.updateBuffered();
    }
    bufferedBytes() {
        return this.connection.dataChannel.bufferedAmount;
    }
    updateBuffered() {
        let oldBuffered = this.buffered;
        let bufferedAmount = this.connection.bufferSize;
        if (this.connection.dataChannel != null) {
            bufferedAmount += this.connection.dataChannel.bufferedAmount;
        }
        this.buffered = bufferedAmount !== 0;
        if (oldBuffered !== this.buffered && this.onBufferChange !== undefined) {
            this.onBufferChange(this.buffered);
        }
    }
}


/***/ }),

/***/ "./src/app/phase/ecsPhase.ts":
/*!***********************************!*\
  !*** ./src/app/phase/ecsPhase.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EcsPhase": () => (/* binding */ EcsPhase)
/* harmony export */ });
/* harmony import */ var _phase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./phase */ "./src/app/phase/phase.ts");
/* harmony import */ var _ecs_world__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ecs/world */ "./src/app/ecs/world.ts");
/* harmony import */ var _ecs_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ecs/component */ "./src/app/ecs/component.ts");



class EcsPhase extends _phase__WEBPACK_IMPORTED_MODULE_0__.Phase {
    constructor(name, isMaster) {
        super(name);
        this.world = new _ecs_world__WEBPACK_IMPORTED_MODULE_1__.World(isMaster);
        this.ecsSetup();
    }
    ecsSetup() {
        (0,_ecs_component__WEBPACK_IMPORTED_MODULE_2__.registerCommonStorage)(this.world);
        this.registerSystems();
    }
    registerSystems() {
    }
    enable() {
        super.enable();
        this.world.enable();
    }
    disable() {
        super.disable();
        this.world.destroy();
    }
}


/***/ }),

/***/ "./src/app/phase/editMap/clientEditMapPhase.ts":
/*!*****************************************************!*\
  !*** ./src/app/phase/editMap/clientEditMapPhase.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ClientEditMapPhase": () => (/* binding */ ClientEditMapPhase)
/* harmony export */ });
/* harmony import */ var _editMapPhase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./editMapPhase */ "./src/app/phase/editMap/editMapPhase.ts");
/* harmony import */ var _ecs_systems_networkSystem__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../ecs/systems/networkSystem */ "./src/app/ecs/systems/networkSystem.ts");


class ClientEditMapPhase extends _editMapPhase__WEBPACK_IMPORTED_MODULE_0__.EditMapPhase {
    constructor(id) {
        super('editClient', false);
        this.networkManager.connectTo(id);
    }
    registerSystems() {
        this.world.addSystem(new _ecs_systems_networkSystem__WEBPACK_IMPORTED_MODULE_1__.ClientNetworkSystem(this.world, this.networkManager.channel));
        super.registerSystems();
    }
}


/***/ }),

/***/ "./src/app/phase/editMap/displayPrecedence.ts":
/*!****************************************************!*\
  !*** ./src/app/phase/editMap/displayPrecedence.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DisplayPrecedence": () => (/* binding */ DisplayPrecedence)
/* harmony export */ });
var DisplayPrecedence;
(function (DisplayPrecedence) {
    DisplayPrecedence[DisplayPrecedence["BACKGROUND"] = 0] = "BACKGROUND";
    DisplayPrecedence[DisplayPrecedence["GRID"] = 10] = "GRID";
    DisplayPrecedence[DisplayPrecedence["LIGHT"] = 100] = "LIGHT";
    DisplayPrecedence[DisplayPrecedence["WALL"] = 210] = "WALL";
    DisplayPrecedence[DisplayPrecedence["PROP"] = 220] = "PROP";
    DisplayPrecedence[DisplayPrecedence["PINS"] = 230] = "PINS";
    DisplayPrecedence[DisplayPrecedence["WALL_CREATOR"] = 260] = "WALL_CREATOR";
    DisplayPrecedence[DisplayPrecedence["TEXT"] = 300] = "TEXT";
})(DisplayPrecedence || (DisplayPrecedence = {}));


/***/ }),

/***/ "./src/app/phase/editMap/editMapPhase.ts":
/*!***********************************************!*\
  !*** ./src/app/phase/editMap/editMapPhase.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditMapPhase": () => (/* binding */ EditMapPhase)
/* harmony export */ });
/* harmony import */ var _ui_edit_editMap_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../ui/edit/editMap.vue */ "./src/app/ui/edit/editMap.vue");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../index */ "./src/app/index.ts");
/* harmony import */ var _ecs_systems_backgroundSystem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ecs/systems/backgroundSystem */ "./src/app/ecs/systems/backgroundSystem.ts");
/* harmony import */ var _ecs_systems_selectionSystem__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ecs/systems/selectionSystem */ "./src/app/ecs/systems/selectionSystem.ts");
/* harmony import */ var _network_networkManager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../network/networkManager */ "./src/app/network/networkManager.ts");
/* harmony import */ var _hostEditMapPhase__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./hostEditMapPhase */ "./src/app/phase/editMap/hostEditMapPhase.ts");
/* harmony import */ var _map_gameMap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../map/gameMap */ "./src/app/map/gameMap.ts");
/* harmony import */ var _ecs_systems_pinSystem__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../ecs/systems/pinSystem */ "./src/app/ecs/systems/pinSystem.ts");
/* harmony import */ var _ecs_systems_wallSystem__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../ecs/systems/wallSystem */ "./src/app/ecs/systems/wallSystem.ts");
/* harmony import */ var _ecs_systems_lightSystem__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../ecs/systems/lightSystem */ "./src/app/ecs/systems/lightSystem.ts");
/* harmony import */ var _ecs_systems_textSystem__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../ecs/systems/textSystem */ "./src/app/ecs/systems/textSystem.ts");
/* harmony import */ var _ecs_systems_visibilitySystem__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../ecs/systems/visibilitySystem */ "./src/app/ecs/systems/visibilitySystem.ts");
/* harmony import */ var _ecs_systems_interactionSystem__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../ecs/systems/interactionSystem */ "./src/app/ecs/systems/interactionSystem.ts");
/* harmony import */ var _ecs_systems_playerSystem__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../ecs/systems/playerSystem */ "./src/app/ecs/systems/playerSystem.ts");
/* harmony import */ var _ecs_systems_visibilityAwareSystem__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../ecs/systems/visibilityAwareSystem */ "./src/app/ecs/systems/visibilityAwareSystem.ts");
/* harmony import */ var _ecs_systems_doorSystem__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../ecs/systems/doorSystem */ "./src/app/ecs/systems/doorSystem.ts");
/* harmony import */ var _ecs_systems_propSystem__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../ecs/systems/propSystem */ "./src/app/ecs/systems/propSystem.ts");
/* harmony import */ var _ecs_systems_pixiGraphicSystem__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../ecs/systems/pixiGraphicSystem */ "./src/app/ecs/systems/pixiGraphicSystem.ts");
/* harmony import */ var _ecs_systems_toolSystem__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../ecs/systems/toolSystem */ "./src/app/ecs/systems/toolSystem.ts");
/* harmony import */ var _ecs_systems_gridSystem__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../ecs/systems/gridSystem */ "./src/app/ecs/systems/gridSystem.ts");
/* harmony import */ var _ecsPhase__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../ecsPhase */ "./src/app/phase/ecsPhase.ts");
/* harmony import */ var _ecs_systems_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../../ecs/systems/pixiBoardSystem */ "./src/app/ecs/systems/pixiBoardSystem.ts");
/* harmony import */ var _ecs_systems_command_commandSystem__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../../ecs/systems/command/commandSystem */ "./src/app/ecs/systems/command/commandSystem.ts");
/* harmony import */ var _ecs_systems_command_commandHistorySystem__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../../ecs/systems/command/commandHistorySystem */ "./src/app/ecs/systems/command/commandHistorySystem.ts");
























class EditMapPhase extends _ecsPhase__WEBPACK_IMPORTED_MODULE_20__.EcsPhase {
    constructor(name, isHost) {
        super(name, isHost);
    }
    ecsSetup() {
        this.setupNetworkManager();
        super.ecsSetup();
        this.world.events.on('selection_update', (group) => {
            this.vue.selectedEntityOpts = group.getCommonEntityOpts();
            this.vue.selectedComponents = group.getCommonComponents();
            this.vue.selectedAddable = group.getAddableComponents();
        });
    }
    registerSystems() {
        super.registerSystems();
        let w = this.world;
        w.addSystem(new _ecs_systems_command_commandSystem__WEBPACK_IMPORTED_MODULE_22__.CommandSystem(w));
        if (w.isMaster) {
            w.addSystem(new _ecs_systems_command_commandHistorySystem__WEBPACK_IMPORTED_MODULE_23__.CommandHistorySystem(w));
        }
        w.addSystem(new _ecs_systems_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_21__.PixiBoardSystem(w));
        w.addSystem(new _ecs_systems_selectionSystem__WEBPACK_IMPORTED_MODULE_3__.SelectionSystem(w));
        w.addSystem(new _ecs_systems_toolSystem__WEBPACK_IMPORTED_MODULE_18__.ToolSystem(w));
        w.addSystem(new _ecs_systems_gridSystem__WEBPACK_IMPORTED_MODULE_19__.GridSystem(w));
        w.addSystem(new _ecs_systems_interactionSystem__WEBPACK_IMPORTED_MODULE_12__.InteractionSystem(w));
        w.addSystem(new _ecs_systems_textSystem__WEBPACK_IMPORTED_MODULE_10__.TextSystem());
        w.addSystem(new _ecs_systems_pixiGraphicSystem__WEBPACK_IMPORTED_MODULE_17__.PixiGraphicSystem(w));
        w.addSystem(new _ecs_systems_backgroundSystem__WEBPACK_IMPORTED_MODULE_2__.BackgroundSystem(w));
        w.addSystem(new _ecs_systems_wallSystem__WEBPACK_IMPORTED_MODULE_8__.WallSystem(w));
        w.addSystem(new _ecs_systems_doorSystem__WEBPACK_IMPORTED_MODULE_15__.DoorSystem(w));
        w.addSystem(new _ecs_systems_visibilitySystem__WEBPACK_IMPORTED_MODULE_11__.VisibilitySystem(w));
        w.addSystem(new _ecs_systems_visibilityAwareSystem__WEBPACK_IMPORTED_MODULE_14__.VisibilityAwareSystem(w));
        w.addSystem(new _ecs_systems_pinSystem__WEBPACK_IMPORTED_MODULE_7__.PinSystem(w));
        w.addSystem(new _ecs_systems_propSystem__WEBPACK_IMPORTED_MODULE_16__.PropSystem(w));
        w.addSystem(new _ecs_systems_playerSystem__WEBPACK_IMPORTED_MODULE_13__.PlayerSystem(w));
        w.addSystem(new _ecs_systems_lightSystem__WEBPACK_IMPORTED_MODULE_9__.LightSystem(w));
    }
    setupNetworkManager() {
        this.networkManager = new _network_networkManager__WEBPACK_IMPORTED_MODULE_4__.NetworkManager(this.world.isMaster);
        this.networkManager.on("ready", this.onNetworkReady, this);
        this.networkManager.on("error", this.onNetworkError, this);
        let connUpdate = () => {
            this.vue.connectionCount = this.networkManager.channel.connections.length;
        };
        let chEvents = this.networkManager.channel.eventEmitter;
        chEvents.on('_device_join', connUpdate);
        chEvents.on('_device_left', connUpdate);
        chEvents.on('_buffering_update', () => {
            this.vue.connectionBuffering = this.networkManager.channel.bufferingChannels > 0;
        });
    }
    // overrides
    onNetworkReady() {
        console.log("Network is ready! side: " + (this.networkManager.isHost ? "master" : "player"));
        if (this.networkManager.isHost) {
            history.replaceState(null, "", '#p' + this.networkManager.peer.id);
        }
    }
    onNetworkError(err) {
        // TODO: open modal or something
        console.error("Error from peerjs: ", err.type);
        if (err.type === 'server-error') {
            alert("Error connecting to peerjs instance, you're offline now");
            if (!this.world.isMaster) {
                _index__WEBPACK_IMPORTED_MODULE_1__.stage.setPhase(new _hostEditMapPhase__WEBPACK_IMPORTED_MODULE_5__.HostEditMapPhase(new _map_gameMap__WEBPACK_IMPORTED_MODULE_6__.GameMap()));
            }
        }
        else if (err.type === 'peer-unavailable') {
            console.log("Invalid invite link");
            alert("Invalid invite link");
            history.replaceState(null, "", ' ');
            if (!this.world.isMaster) {
                _index__WEBPACK_IMPORTED_MODULE_1__.stage.setPhase(new _hostEditMapPhase__WEBPACK_IMPORTED_MODULE_5__.HostEditMapPhase(new _map_gameMap__WEBPACK_IMPORTED_MODULE_6__.GameMap()));
            }
        }
        else if (err.ty === 'network') {
            alert("Connection lost");
        }
        else {
            alert(err);
        }
    }
    ui() {
        let ui = new _ui_edit_editMap_vue__WEBPACK_IMPORTED_MODULE_0__.default({
            propsData: {
                phase: this,
                world: this.world,
                isAdmin: this.world.isMaster,
            }
        });
        //(ui as any).phase = this;
        //(ui as any).isAdmin = this.world.isMaster;
        return ui;
    }
    disable() {
        super.disable();
        this.networkManager.disconnect();
    }
}


/***/ }),

/***/ "./src/app/phase/editMap/hostEditMapPhase.ts":
/*!***************************************************!*\
  !*** ./src/app/phase/editMap/hostEditMapPhase.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HostEditMapPhase": () => (/* binding */ HostEditMapPhase)
/* harmony export */ });
/* harmony import */ var _editMapPhase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./editMapPhase */ "./src/app/phase/editMap/editMapPhase.ts");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../index */ "./src/app/index.ts");
/* harmony import */ var _map_mapLevel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../map/mapLevel */ "./src/app/map/mapLevel.ts");
/* harmony import */ var _ecs_systems_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ecs/systems/pixiBoardSystem */ "./src/app/ecs/systems/pixiBoardSystem.ts");
/* harmony import */ var _ecs_systems_networkSystem__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ecs/systems/networkSystem */ "./src/app/ecs/systems/networkSystem.ts");
/* harmony import */ var _ecs_systems_command_command__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../ecs/systems/command/command */ "./src/app/ecs/systems/command/command.ts");
/* provided dependency */ var PIXI = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/pixi.es.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};






class HostEditMapPhase extends _editMapPhase__WEBPACK_IMPORTED_MODULE_0__.EditMapPhase {
    constructor(map) {
        super('editHost', true);
        this.map = map;
        if (this.map.levels.size == 0) {
            this.map.levels.set(42, new _map_mapLevel__WEBPACK_IMPORTED_MODULE_2__.MapLevel(42));
        }
        this.currentLevel = this.map.levels.values().next().value;
        this.world.events.on('command_history_change', (canUndo, canRedo) => {
            this.vue.canUndo = canUndo;
            this.vue.canRedo = canRedo;
        });
        this.world.events.on('selection_update', (group) => {
            this.vue.selectedEntityOpts = group.getCommonEntityOpts();
            this.vue.selectedComponents = group.getCommonComponents();
            this.vue.selectedAddable = group.getAddableComponents();
        });
    }
    registerSystems() {
        this.world.addSystem(new _ecs_systems_networkSystem__WEBPACK_IMPORTED_MODULE_4__.HostNetworkSystem(this.world, this.networkManager.channel));
        super.registerSystems();
    }
    onDrop(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.stopPropagation();
            event.preventDefault();
            let x = event.pageX;
            let y = event.pageY;
            if (event.dataTransfer.items) {
                let res = [];
                for (let f of event.dataTransfer.items) {
                    let file = f.getAsFile();
                    if (file != null) {
                        res.push(file);
                    }
                }
                yield this.onFileDrop(res, x, y);
            }
            else {
                yield this.onFileDrop(event.dataTransfer.files, x, y);
            }
        });
    }
    onDragOver(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        return false;
    }
    onFileDrop(files, x, y) {
        return __awaiter(this, void 0, void 0, function* () {
            if (files.length == 0)
                return;
            let firstFile = files[0];
            // Sometimes this does not work but the problem is not the matrix calculation, it's the browser coords
            // so if you have firefox and linux (this seems to be the wrong stack) and have spare time, pls debug this.
            // Could be caused by: https://bugzilla.mozilla.org/show_bug.cgi?id=505521#c80
            let p = new PIXI.Point(x, y);
            let pixiBoard = this.world.systems.get(_ecs_systems_pixiBoardSystem__WEBPACK_IMPORTED_MODULE_3__.PIXI_BOARD_TYPE);
            pixiBoard.board.updateTransform();
            pixiBoard.board.transform.worldTransform.applyInverse(p, p);
            if (firstFile.type.startsWith("image/")) {
                let cmd = {
                    kind: 'spawn',
                    entities: [{
                            id: -1,
                            components: [
                                {
                                    type: 'name',
                                    name: firstFile.name,
                                    clientVisible: false,
                                },
                                {
                                    type: "position",
                                    x: p.x,
                                    y: p.y,
                                },
                                {
                                    type: "transform",
                                    rotation: 0,
                                    scale: 1,
                                },
                                {
                                    type: "background_image",
                                    imageType: firstFile.type,
                                    image: new Uint8Array(yield firstFile.arrayBuffer()),
                                },
                            ]
                        }]
                };
                (0,_ecs_systems_command_command__WEBPACK_IMPORTED_MODULE_5__.executeAndLogCommand)(this.world, cmd);
                console.log("Image loaded");
            }
        });
    }
    exportMap() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentLevel.saveFrom(this.world);
            let blob = yield this.map.saveToFile();
            this.saveBlob(blob, "map.dndm");
        });
    }
    saveBlob(blob, fileName) {
        let a = document.getElementById("hidden-download-link");
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    enable() {
        super.enable();
        _index__WEBPACK_IMPORTED_MODULE_1__.app.view.ondrop = this.onDrop.bind(this);
        _index__WEBPACK_IMPORTED_MODULE_1__.app.view.ondragover = this.onDragOver.bind(this);
        this.currentLevel.loadInto(this.world);
        //let ch = this.networkManager.channel.eventEmitter;
        //ch.on("_device_join", this.onDeviceJoin, this);
    }
    disable() {
        //let ch = this.networkManager.channel.eventEmitter;
        //ch.off("_device_join", this.onDeviceJoin, this);
        _index__WEBPACK_IMPORTED_MODULE_1__.app.view.ondrop = () => { };
        _index__WEBPACK_IMPORTED_MODULE_1__.app.view.ondragover = () => { };
        super.disable();
    }
}


/***/ }),

/***/ "./src/app/phase/homePhase.ts":
/*!************************************!*\
  !*** ./src/app/phase/homePhase.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HomePhase": () => (/* binding */ HomePhase)
/* harmony export */ });
/* harmony import */ var _phase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./phase */ "./src/app/phase/phase.ts");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../index */ "./src/app/index.ts");
/* harmony import */ var _ui_home_home_vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ui/home/home.vue */ "./src/app/ui/home/home.vue");
/* harmony import */ var _map_gameMap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../map/gameMap */ "./src/app/map/gameMap.ts");
/* harmony import */ var _editMap_hostEditMapPhase__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./editMap/hostEditMapPhase */ "./src/app/phase/editMap/hostEditMapPhase.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





class HomePhase extends _phase__WEBPACK_IMPORTED_MODULE_0__.Phase {
    constructor() {
        super("home");
    }
    ui() {
        return new _ui_home_home_vue__WEBPACK_IMPORTED_MODULE_2__.default();
    }
    createMap() {
        let map = new _map_gameMap__WEBPACK_IMPORTED_MODULE_3__.GameMap();
        _index__WEBPACK_IMPORTED_MODULE_1__.stage.setPhase(new _editMap_hostEditMapPhase__WEBPACK_IMPORTED_MODULE_4__.HostEditMapPhase(map));
    }
    editMap(file) {
        return __awaiter(this, void 0, void 0, function* () {
            let map = yield _map_gameMap__WEBPACK_IMPORTED_MODULE_3__.GameMap.loadFromFile(file);
            _index__WEBPACK_IMPORTED_MODULE_1__.stage.setPhase(new _editMap_hostEditMapPhase__WEBPACK_IMPORTED_MODULE_4__.HostEditMapPhase(map));
        });
    }
    enable() {
        super.enable();
        this.uiEventEmitter.on('create_map', this.createMap, this);
        this.uiEventEmitter.on('edit', this.editMap, this);
    }
    disable() {
        this.uiEventEmitter.on('edit', this.editMap, this);
        this.uiEventEmitter.on('create_map', this.createMap, this);
        super.disable();
    }
}


/***/ }),

/***/ "./src/app/phase/loadingPhase.ts":
/*!***************************************!*\
  !*** ./src/app/phase/loadingPhase.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LoadingPhase": () => (/* binding */ LoadingPhase)
/* harmony export */ });
/* harmony import */ var _phase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./phase */ "./src/app/phase/phase.ts");
/* harmony import */ var _ui_loading_loading_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ui/loading/loading.vue */ "./src/app/ui/loading/loading.vue");


class LoadingPhase extends _phase__WEBPACK_IMPORTED_MODULE_0__.Phase {
    constructor() {
        super("loading");
    }
    ui() {
        return new _ui_loading_loading_vue__WEBPACK_IMPORTED_MODULE_1__.default();
    }
}


/***/ }),

/***/ "./src/app/phase/phase.ts":
/*!********************************!*\
  !*** ./src/app/phase/phase.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Phase": () => (/* binding */ Phase)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.esm.js");
/* harmony import */ var eventemitter3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! eventemitter3 */ "./node_modules/eventemitter3/index.js");
/* harmony import */ var eventemitter3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(eventemitter3__WEBPACK_IMPORTED_MODULE_0__);


class Phase {
    constructor(name) {
        this.name = name;
        // Create Vue instance that is responsible for handling the UI events of the current phase.
        // https://medium.com/vuejobs/create-a-global-event-bus-in-vue-js-838a5d9ab03a
        this.uiEventEmitter = new eventemitter3__WEBPACK_IMPORTED_MODULE_0__();
    }
    log(message) {
        console.log(`[${this.name}] ` + message);
    }
    ui() {
        return undefined;
    }
    enable() {
        this.log("Enabling");
        vue__WEBPACK_IMPORTED_MODULE_1__.default.prototype.eventEmitter = this.uiEventEmitter;
        this.vue = this.ui();
        if (this.vue) {
            this.vue.$mount();
            document.body.appendChild(this.vue.$el);
        }
        // Done ^^
    }
    disable() {
        console.log(`[${this.name}] Disabling`);
        if (this.vue) {
            document.body.removeChild(this.vue.$el);
        }
    }
    /**
     * Overrides the `Object.prototype.toString.call(obj)` result.
     * This is done to hide this object and its children from observers (see https://github.com/vuejs/vue/issues/2637)
     * @returns {string} - type name
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag}
     */
    get [Symbol.toStringTag]() {
        // Anything can go here really as long as it's not 'Object'
        return 'ObjectNoObserve';
    }
}


/***/ }),

/***/ "./src/app/phase/stage.ts":
/*!********************************!*\
  !*** ./src/app/phase/stage.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Stage": () => (/* binding */ Stage)
/* harmony export */ });
/* harmony import */ var _phase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./phase */ "./src/app/phase/phase.ts");

class Stage extends _phase__WEBPACK_IMPORTED_MODULE_0__.Phase {
    constructor(name) {
        super(name);
        this.phase = null;
    }
    setPhase(phase) {
        if (this.phase)
            this.phase.disable();
        this.phase = phase;
        if (this.phase)
            this.phase.enable();
    }
    disable() {
        super.disable();
        this.setPhase(null);
    }
}


/***/ }),

/***/ "./src/app/ui/vue.ts":
/*!***************************!*\
  !*** ./src/app/ui/vue.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Vue": () => (/* reexport safe */ vue_property_decorator__WEBPACK_IMPORTED_MODULE_0__.Vue),
/* harmony export */   "VComponent": () => (/* reexport safe */ vue_property_decorator__WEBPACK_IMPORTED_MODULE_0__.Component),
/* harmony export */   "VProp": () => (/* reexport safe */ vue_property_decorator__WEBPACK_IMPORTED_MODULE_0__.Prop),
/* harmony export */   "VWatch": () => (/* reexport safe */ vue_property_decorator__WEBPACK_IMPORTED_MODULE_0__.Watch),
/* harmony export */   "VRef": () => (/* reexport safe */ vue_property_decorator__WEBPACK_IMPORTED_MODULE_0__.Ref),
/* harmony export */   "VWatchImmediate": () => (/* binding */ VWatchImmediate)
/* harmony export */ });
/* harmony import */ var vue_property_decorator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue-property-decorator */ "./node_modules/vue-property-decorator/lib/index.js");


function VWatchImmediate(name) {
    return (0,vue_property_decorator__WEBPACK_IMPORTED_MODULE_0__.Watch)(name, { immediate: true });
}


/***/ }),

/***/ "./src/app/util/array.ts":
/*!*******************************!*\
  !*** ./src/app/util/array.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "arrayRemoveElem": () => (/* binding */ arrayRemoveElem)
/* harmony export */ });
function arrayRemoveElem(arr, elem) {
    let index = arr.indexOf(elem);
    if (index !== -1)
        arr.splice(index, 1);
    return index !== -1;
}


/***/ }),

/***/ "./src/app/util/binaryHeap.ts":
/*!************************************!*\
  !*** ./src/app/util/binaryHeap.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BinaryHeap": () => (/* binding */ BinaryHeap)
/* harmony export */ });
// Binary heap implementation from:
// http://eloquentjavascript.net/appendix2.html
class BinaryHeap {
    constructor(cmpLt) {
        this.content = new Array();
        this.elemMap = new Map();
        this.cmpLt = cmpLt;
    }
    push(element) {
        // Add the new element to the end of the array.
        this.elemMap.set(element, this.content.length);
        this.content.push(element);
        // Allow it to bubble up.
        this.bubbleUp(this.content.length - 1);
    }
    pop() {
        if (this.content.length === 0)
            return undefined;
        // Store the first element so we can return it later.
        let result = this.content[0];
        this.elemMap.delete(result);
        // Get the element at the end of the array.
        let end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it sink down.
        if (this.content.length !== 0) {
            this.content[0] = end;
            this.elemMap.set(end, 0);
            this.sinkDown(0);
        }
        return result;
    }
    popElem(e) {
        let index = this.elemMap.get(e);
        if (index === undefined)
            return;
        this.elemMap.delete(e);
        let end = this.content.pop();
        if (index === this.content.length)
            return;
        this.content[index] = end;
        this.elemMap.set(end, index);
        this.sinkDown(index);
        this.bubbleUp(index); // Fix, some systems where a < b. b < c => a < c is not maintained
    }
    hasElem(e) {
        return this.elemMap.has(e);
    }
    peek() {
        return this.content[0];
    }
    size() {
        return this.content.length;
    }
    bubbleUp(n) {
        // Fetch the element that has to be moved.
        let element = this.content[n];
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            let parentN = Math.floor((n + 1) / 2) - 1;
            let parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.cmpLt(element, parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                this.elemMap.set(element, parentN);
                this.elemMap.set(parent, n);
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to move it further.
            else {
                break;
            }
        }
    }
    sinkDown(n) {
        // Look up the target element and its score.
        let length = this.content.length;
        let element = this.content[n];
        while (true) {
            // Compute the indices of the child elements.
            let child2N = (n + 1) * 2, child1N = child2N - 1;
            // This is used to store the new position of the element,
            // if any.
            let swap = null;
            let child1 = undefined;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                child1 = this.content[child1N];
                // If the score is less than our element's, we need to swap.
                if (this.cmpLt(child1, element))
                    swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                let child2 = this.content[child2N];
                if (this.cmpLt(child2, swap == null ? element : child1)) {
                    swap = child2N;
                }
            }
            // If the element needs to be moved, swap it, and continue.
            if (swap != null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                this.elemMap.set(this.content[n], n);
                this.elemMap.set(element, swap);
                n = swap;
            }
            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
}


/***/ }),

/***/ "./src/app/util/bitSet.ts":
/*!********************************!*\
  !*** ./src/app/util/bitSet.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BitSet": () => (/* binding */ BitSet)
/* harmony export */ });
/**
 * Basic BitSet
 */
class BitSet {
    constructor(data) {
        if (typeof data === 'number') {
            this.data = new Uint32Array(Math.ceil(length / 32));
        }
        else if (data.BYTES_PER_ELEMENT === 4) {
            this.data = data;
        }
        else {
            let len = Math.floor(data.byteLength / Uint32Array.BYTES_PER_ELEMENT);
            this.data = new Uint32Array(data.buffer, data.byteOffset, len);
        }
    }
    get size() {
        return this.data.length << 5;
    }
    get(i) {
        i |= 0;
        let wi = i >>> 5;
        if (wi >= this.data.length)
            return false;
        let b = this.data[wi];
        return !!((b >>> i) & 1);
    }
    ensureCapacity(wi) {
        let newLen = this.data.length;
        while (newLen < wi)
            newLen *= 2;
        if (newLen === this.data.length)
            return;
        let newData = new Uint32Array(newLen);
        newData.set(this.data);
        this.data = newData;
    }
    set(i) {
        i |= 0;
        let wi = i >>> 5;
        this.ensureCapacity(wi);
        this.data[wi] |= 1 << i;
    }
    reset(i) {
        i |= 0;
        let wi = i >>> 5;
        this.ensureCapacity(wi);
        this.data[wi] &= ~(1 << i);
    }
    isAll(target, until) {
        let t = 0;
        if (target) {
            t = 0xFFFFFFFF;
        }
        let loopLast = until === undefined ? this.data.length : (until >>> 5);
        for (let i = 0; i < loopLast; i++) {
            if (this.data[i] !== t)
                return false;
        }
        if (until === undefined)
            return true;
        let i = ((until - 1) >> 5) + 1;
        let il = until & 0x1F;
        let mask = (1 << il) - 1;
        let d = this.data[i];
        if (target) {
            d = ~d;
        }
        return (d & mask) === 0;
    }
}


/***/ }),

/***/ "./src/app/util/eventEmitterWrapper.ts":
/*!*********************************************!*\
  !*** ./src/app/util/eventEmitterWrapper.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventEmitterWrapper": () => (/* binding */ EventEmitterWrapper)
/* harmony export */ });
/* harmony import */ var eventemitter3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! eventemitter3 */ "./node_modules/eventemitter3/index.js");
/* harmony import */ var eventemitter3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(eventemitter3__WEBPACK_IMPORTED_MODULE_0__);

class EventEmitterWrapper extends eventemitter3__WEBPACK_IMPORTED_MODULE_0__ {
    constructor(catcher) {
        super();
        this.caught = new Set();
        this.catcher = catcher;
    }
    catchEvent(event) {
        this.catcher(event, this);
        this.caught.add(event);
    }
    on(event, fn, context) {
        super.on(event, fn, context);
        if (!this.caught.has(event)) {
            this.catchEvent(event);
        }
        return this;
    }
    addListener(event, fn, context) {
        super.addListener(event, fn, context);
        if (!this.caught.has(event)) {
            this.catchEvent(event);
        }
        return this;
    }
}


/***/ }),

/***/ "./src/app/util/geometry.ts":
/*!**********************************!*\
  !*** ./src/app/util/geometry.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "polygonPointIntersect": () => (/* binding */ polygonPointIntersect),
/* harmony export */   "aabbAabbIntersect": () => (/* binding */ aabbAabbIntersect),
/* harmony export */   "distSquared2d": () => (/* binding */ distSquared2d),
/* harmony export */   "projectPointOnSegment": () => (/* binding */ projectPointOnSegment),
/* harmony export */   "intersectLineVsLine": () => (/* binding */ intersectLineVsLine)
/* harmony export */ });
function polygonPointIntersect(point, polygon) {
    const x = point.x;
    const y = point.y;
    let inside = false;
    // use some raycasting to test hits
    // https://github.com/substack/point-in-polygon/blob/master/index.js
    const length = polygon.length / 2;
    for (let i = 0, j = length - 1; i < length; j = i++) {
        const xi = polygon[i * 2];
        const yi = polygon[(i * 2) + 1];
        const xj = polygon[j * 2];
        const yj = polygon[(j * 2) + 1];
        const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * ((y - yi) / (yj - yi))) + xi);
        if (intersect) {
            inside = !inside;
        }
    }
    return inside;
}
function aabbAabbIntersect(al, at, ar, ab, bl, bt, br, bb) {
    return al < br && ar > bl && at < bb && ab > bt;
}
function distSquared2d(x1, y1, x2, y2) {
    let x = x1 - x2;
    let y = y1 - y2;
    return x * x + y * y;
}
function projectPointOnSegment(ax, ay, bx, by, px, py) {
    if (ax == bx && ay == ay)
        ax -= 0.00001;
    let u = ((px - ax) * (bx - ax)) + ((py - ay) * (by - ay));
    let udenom = Math.pow(bx - ax, 2) + Math.pow(by - ay, 2);
    u /= udenom;
    let rx = ax + (u * (bx - ax));
    let ry = ay + (u * (by - ay));
    let minx, maxx, miny, maxy;
    minx = Math.min(ax, bx);
    maxx = Math.max(ax, bx);
    miny = Math.min(ay, by);
    maxy = Math.max(ay, by);
    let isValid = (rx >= minx && rx <= maxx) && (ry >= miny && ry <= maxy);
    return isValid ? [rx, ry] : undefined;
}
function intersectLineVsLine(a1, a2, b1, b2, target) {
    let dbx = b2.x - b1.x;
    let dby = b2.y - b1.y;
    let dax = a2.x - a1.x;
    let day = a2.y - a1.y;
    let u_b = dby * dax - dbx * day;
    if (u_b == 0) {
        return false;
    }
    let ua = (dbx * (a1.y - b1.y) - dby * (a1.x - b1.x)) / u_b;
    if (target !== undefined) {
        target.set(a1.x - ua * -dax, a1.y - ua * -day);
    }
    return true;
}


/***/ }),

/***/ "./src/app/util/k2dTree.ts":
/*!*********************************!*\
  !*** ./src/app/util/k2dTree.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "K2dTree": () => (/* binding */ K2dTree)
/* harmony export */ });
class Node {
    constructor(point, parent, dimension) {
        this.left = undefined;
        this.right = undefined;
        this.point = point;
        this.parent = parent;
        this.dimension = dimension;
    }
}
class K2dTree {
    constructor() {
        this.root = undefined;
    }
    distance(a, b) {
        let dx = a[0] - b[0];
        let dy = a[1] - b[1];
        return dx * dx + dy * dy;
    }
    lastSearch(point, node, parent) {
        while (node !== undefined) {
            parent = node;
            if (point[node.dimension] < node.point[node.dimension]) {
                node = node.left;
            }
            else {
                node = node.right;
            }
        }
        return parent;
    }
    nodeSearch(point) {
        let node = this.root;
        while (node !== undefined) {
            if (point[0] === node.point[0] && point[1] === node.point[1]) {
                return node;
            }
            if (point[node.dimension] < node.point[node.dimension]) {
                node = node.left;
            }
            else {
                node = node.right;
            }
        }
        return undefined;
    }
    insert(point) {
        let insertPosition = this.lastSearch(point, this.root, undefined);
        if (insertPosition === undefined) {
            this.root = new Node(point, undefined, 0);
            return;
        }
        let newNode = new Node(point, insertPosition, (insertPosition.dimension + 1) & 1);
        let dimension = insertPosition.dimension;
        if (point[dimension] < insertPosition.point[dimension]) {
            insertPosition.left = newNode;
        }
        else {
            insertPosition.right = newNode;
        }
    }
    findMin(node, dim) {
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
    removeNode(node) {
        if (node.left === undefined && node.right === undefined) {
            if (node.parent === undefined) {
                this.root = undefined;
                return;
            }
            let dim = node.parent.dimension;
            if (node.point[dim] < node.parent.point[dim]) {
                node.parent.left = undefined;
            }
            else {
                node.parent.right = undefined;
            }
            return;
        }
        // If the right subtree is not empty, swap with the minimum element on the
        // node's dimension. If it is empty, we swap the left and right subtrees and
        // do the same.
        if (node.right !== undefined) {
            let nextNode = this.findMin(node.right, node.dimension);
            let nextPoint = nextNode.point;
            this.removeNode(nextNode);
            node.point = nextPoint;
        }
        else {
            let nextNode = this.findMin(node.left, node.dimension);
            let nextPoint = nextNode.point;
            this.removeNode(nextNode);
            node.right = node.left;
            node.left = undefined;
            node.point = nextPoint;
        }
    }
    remove(point) {
        let node = this.nodeSearch(point);
        if (node === undefined)
            return false;
        this.removeNode(node);
        return true;
    }
    nearestPoint(point, root) {
        root = root || this.root;
        if (root === undefined)
            return undefined;
        let ownDistance = this.distance(root.point, point);
        if (root.left === undefined && root.right === undefined) {
            return [root.point, ownDistance];
        }
        let bestChild;
        if (root.right === undefined) {
            bestChild = root.left;
        }
        else if (root.left === undefined) {
            bestChild = root.right;
        }
        else {
            if (point[root.dimension] < root.point[root.dimension]) {
                bestChild = root.left;
            }
            else {
                bestChild = root.right;
            }
        }
        let [bestChildNode, bestChildDist] = this.nearestPoint(point, bestChild);
        let bestNode;
        let bestDist;
        if (bestChildDist < ownDistance) {
            bestNode = bestChildNode;
            bestDist = bestChildDist;
        }
        else {
            bestNode = root.point;
            bestDist = ownDistance;
        }
        // Searched point projected to our axis
        let linearPoint = [point[0], point[1]];
        linearPoint[root.dimension] = root.point[root.dimension];
        let linearDist = this.distance(linearPoint, point);
        if (linearDist < bestDist) {
            let otherChild;
            if (bestChild === root.left) {
                otherChild = root.right;
            }
            else {
                otherChild = root.left;
            }
            if (otherChild !== undefined) {
                let [otherNode, otherDist] = this.nearestPoint(point, otherChild);
                if (otherDist < bestDist) {
                    bestNode = otherNode;
                    bestDist = otherDist;
                }
            }
        }
        return [bestNode, bestDist];
    }
}


/***/ }),

/***/ "./src/app/util/pixi.ts":
/*!******************************!*\
  !*** ./src/app/util/pixi.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DESTROY_ALL": () => (/* binding */ DESTROY_ALL),
/* harmony export */   "DESTROY_MIN": () => (/* binding */ DESTROY_MIN),
/* harmony export */   "loadTexture": () => (/* binding */ loadTexture),
/* harmony export */   "CUSTOM_BLEND_MODES": () => (/* binding */ CUSTOM_BLEND_MODES),
/* harmony export */   "addCustomBlendModes": () => (/* binding */ addCustomBlendModes)
/* harmony export */ });
/* harmony import */ var _PIXI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../PIXI */ "./src/app/PIXI.ts");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../index */ "./src/app/index.ts");


const DESTROY_ALL = {
    children: true,
    texture: true,
    baseTexture: true,
};
const DESTROY_MIN = {
    children: false,
    texture: false,
    baseTexture: false,
};
const ALLOWED_IMAGETYPES = ['jpeg', 'png', 'x-jg', 'bmp', 'x-icon', 'ief', 'pjpeg', 'x-portable-bitmap', 'x-rgb', 'tiff', 'x-tiff'];
function validateImageMimeType(type) {
    if (!type.startsWith('image/'))
        throw 'Invalid type: it should be an image';
    if (ALLOWED_IMAGETYPES.indexOf(type.substr('image/'.length)) < 0)
        throw 'Unsupported image type';
}
function loadTexture(data, dataType) {
    validateImageMimeType(dataType);
    let typedArray = new Uint8Array(data);
    let b64 = 'data:' + dataType + ';base64,' + btoa(typedArray.reduce((data, byte) => {
        return data + String.fromCharCode(byte);
    }, ''));
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = () => {
            const tex = new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.Texture(new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.BaseTexture(new _PIXI__WEBPACK_IMPORTED_MODULE_0__.default.resources.ImageResource(image)));
            resolve(tex);
        };
        image.onerror = reject;
        image.src = b64;
    });
}
var CUSTOM_BLEND_MODES;
(function (CUSTOM_BLEND_MODES) {
    CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["MULTIPLY_COLOR_ONLY"] = 30] = "MULTIPLY_COLOR_ONLY";
    CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["ADD_WHERE_ALPHA_1"] = 31] = "ADD_WHERE_ALPHA_1";
})(CUSTOM_BLEND_MODES || (CUSTOM_BLEND_MODES = {}));
function addCustomBlendModes() {
    let gl = _index__WEBPACK_IMPORTED_MODULE_1__.app.renderer.gl;
    let array = _index__WEBPACK_IMPORTED_MODULE_1__.app.renderer.state.blendModes;
    array[CUSTOM_BLEND_MODES.MULTIPLY_COLOR_ONLY] = [gl.DST_COLOR, gl.ZERO, gl.ONE, gl.ZERO];
    array[CUSTOM_BLEND_MODES.ADD_WHERE_ALPHA_1] = [gl.DST_ALPHA, gl.ONE, gl.ZERO, gl.ONE];
}


/***/ }),

/***/ "./src/app/util/safeEventEmitter.ts":
/*!******************************************!*\
  !*** ./src/app/util/safeEventEmitter.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SafeEventEmitter)
/* harmony export */ });
class SafeEventEmitter {
    constructor() {
        this.events = {};
    }
    emit(event, ...args) {
        let listeners = this.events[event];
        if (listeners === undefined || listeners.length === 0)
            return false;
        let length = listeners.length;
        for (let i = 0; i < length;) {
            let listener = listeners[i];
            try {
                listener.cb.call(listener.self, ...args);
            }
            catch (b) {
                console.error("Error while calling event " + event, b);
            }
            if (listener.once) {
                listeners.splice(i, 1);
                length--;
            }
            else {
                i++;
            }
        }
        return true;
    }
    /**
     * Add a listener for a given event.
     */
    on(event, fn, context) {
        let listeners = this.events[event];
        if (listeners === undefined) {
            listeners = [];
            this.events[event] = listeners;
        }
        listeners.push({
            cb: fn,
            self: context,
            once: false,
        });
        return this;
    }
    /**
     * Add a one-time listener for a given event.
     */
    once(event, fn, context) {
        let listeners = this.events[event];
        if (listeners === undefined) {
            listeners = [];
            this.events[event] = listeners;
        }
        listeners.push({
            cb: fn,
            self: context,
            once: true,
        });
        return this;
    }
    /**
     * Remove the listeners of a given event.
     */
    off(event, fn, context, once) {
        let listeners = this.events[event];
        if (listeners === undefined)
            throw 'Cannot find event ' + event;
        let length = listeners.length;
        for (let i = 0; i < length; i++) {
            let listener = listeners[i];
            if (listener.cb === fn && listener.self === context) {
                listeners.splice(i, 1);
                return this;
            }
        }
        throw 'Cannot find event ' + event;
    }
    /**
     * Remove all listeners, or those of the specified event.
     */
    removeAllListeners(event) {
        if (event !== undefined) {
            this.events[event] = [];
        }
        else {
            this.events = {};
        }
        return this;
    }
}


/***/ }),

/***/ "./src/app/ui/ecs/compWrapper.vue":
/*!****************************************!*\
  !*** ./src/app/ui/ecs/compWrapper.vue ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _compWrapper_vue_vue_type_template_id_03d324d6_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./compWrapper.vue?vue&type=template&id=03d324d6&scoped=true& */ "./src/app/ui/ecs/compWrapper.vue?vue&type=template&id=03d324d6&scoped=true&");
/* harmony import */ var _compWrapper_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./compWrapper.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/compWrapper.vue?vue&type=script&lang=ts&");
/* harmony import */ var _compWrapper_vue_vue_type_style_index_0_id_03d324d6_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./compWrapper.vue?vue&type=style&index=0&id=03d324d6&scoped=true&lang=css& */ "./src/app/ui/ecs/compWrapper.vue?vue&type=style&index=0&id=03d324d6&scoped=true&lang=css&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");



;


/* normalize component */

var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__.default)(
  _compWrapper_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _compWrapper_vue_vue_type_template_id_03d324d6_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _compWrapper_vue_vue_type_template_id_03d324d6_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "03d324d6",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/compWrapper.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/ecsBackgroundImage.vue":
/*!***********************************************!*\
  !*** ./src/app/ui/ecs/ecsBackgroundImage.vue ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecsBackgroundImage_vue_vue_type_template_id_5efd7016_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecsBackgroundImage.vue?vue&type=template&id=5efd7016&scoped=true& */ "./src/app/ui/ecs/ecsBackgroundImage.vue?vue&type=template&id=5efd7016&scoped=true&");
/* harmony import */ var _ecsBackgroundImage_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ecsBackgroundImage.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/ecsBackgroundImage.vue?vue&type=script&lang=ts&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _ecsBackgroundImage_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _ecsBackgroundImage_vue_vue_type_template_id_5efd7016_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _ecsBackgroundImage_vue_vue_type_template_id_5efd7016_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "5efd7016",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/ecsBackgroundImage.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/ecsDoor.vue":
/*!************************************!*\
  !*** ./src/app/ui/ecs/ecsDoor.vue ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecsDoor_vue_vue_type_template_id_1862e8b5_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecsDoor.vue?vue&type=template&id=1862e8b5&scoped=true& */ "./src/app/ui/ecs/ecsDoor.vue?vue&type=template&id=1862e8b5&scoped=true&");
/* harmony import */ var _ecsDoor_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ecsDoor.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/ecsDoor.vue?vue&type=script&lang=ts&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _ecsDoor_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _ecsDoor_vue_vue_type_template_id_1862e8b5_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _ecsDoor_vue_vue_type_template_id_1862e8b5_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "1862e8b5",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/ecsDoor.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/ecsLight.vue":
/*!*************************************!*\
  !*** ./src/app/ui/ecs/ecsLight.vue ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecsLight_vue_vue_type_template_id_724e011f_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecsLight.vue?vue&type=template&id=724e011f&scoped=true& */ "./src/app/ui/ecs/ecsLight.vue?vue&type=template&id=724e011f&scoped=true&");
/* harmony import */ var _ecsLight_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ecsLight.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/ecsLight.vue?vue&type=script&lang=ts&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _ecsLight_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _ecsLight_vue_vue_type_template_id_724e011f_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _ecsLight_vue_vue_type_template_id_724e011f_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "724e011f",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/ecsLight.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/ecsName.vue":
/*!************************************!*\
  !*** ./src/app/ui/ecs/ecsName.vue ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecsName_vue_vue_type_template_id_3e768912_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecsName.vue?vue&type=template&id=3e768912&scoped=true& */ "./src/app/ui/ecs/ecsName.vue?vue&type=template&id=3e768912&scoped=true&");
/* harmony import */ var _ecsName_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ecsName.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/ecsName.vue?vue&type=script&lang=ts&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _ecsName_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _ecsName_vue_vue_type_template_id_3e768912_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _ecsName_vue_vue_type_template_id_3e768912_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "3e768912",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/ecsName.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/ecsNote.vue":
/*!************************************!*\
  !*** ./src/app/ui/ecs/ecsNote.vue ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecsNote_vue_vue_type_template_id_2effb2f9_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecsNote.vue?vue&type=template&id=2effb2f9&scoped=true& */ "./src/app/ui/ecs/ecsNote.vue?vue&type=template&id=2effb2f9&scoped=true&");
/* harmony import */ var _ecsNote_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ecsNote.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/ecsNote.vue?vue&type=script&lang=ts&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _ecsNote_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _ecsNote_vue_vue_type_template_id_2effb2f9_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _ecsNote_vue_vue_type_template_id_2effb2f9_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "2effb2f9",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/ecsNote.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/ecsPin.vue":
/*!***********************************!*\
  !*** ./src/app/ui/ecs/ecsPin.vue ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecsPin_vue_vue_type_template_id_26d88e5e_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecsPin.vue?vue&type=template&id=26d88e5e&scoped=true& */ "./src/app/ui/ecs/ecsPin.vue?vue&type=template&id=26d88e5e&scoped=true&");
/* harmony import */ var _ecsPin_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ecsPin.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/ecsPin.vue?vue&type=script&lang=ts&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _ecsPin_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _ecsPin_vue_vue_type_template_id_26d88e5e_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _ecsPin_vue_vue_type_template_id_26d88e5e_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "26d88e5e",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/ecsPin.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/ecsPlayer.vue":
/*!**************************************!*\
  !*** ./src/app/ui/ecs/ecsPlayer.vue ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecsPlayer_vue_vue_type_template_id_636ceea8_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecsPlayer.vue?vue&type=template&id=636ceea8&scoped=true& */ "./src/app/ui/ecs/ecsPlayer.vue?vue&type=template&id=636ceea8&scoped=true&");
/* harmony import */ var _ecsPlayer_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ecsPlayer.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/ecsPlayer.vue?vue&type=script&lang=ts&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _ecsPlayer_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _ecsPlayer_vue_vue_type_template_id_636ceea8_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _ecsPlayer_vue_vue_type_template_id_636ceea8_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "636ceea8",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/ecsPlayer.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/ecsPosition.vue":
/*!****************************************!*\
  !*** ./src/app/ui/ecs/ecsPosition.vue ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecsPosition_vue_vue_type_template_id_e81e4da0_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecsPosition.vue?vue&type=template&id=e81e4da0&scoped=true& */ "./src/app/ui/ecs/ecsPosition.vue?vue&type=template&id=e81e4da0&scoped=true&");
/* harmony import */ var _ecsPosition_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ecsPosition.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/ecsPosition.vue?vue&type=script&lang=ts&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _ecsPosition_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _ecsPosition_vue_vue_type_template_id_e81e4da0_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _ecsPosition_vue_vue_type_template_id_e81e4da0_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "e81e4da0",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/ecsPosition.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/ecsPropTeleport.vue":
/*!********************************************!*\
  !*** ./src/app/ui/ecs/ecsPropTeleport.vue ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecsPropTeleport_vue_vue_type_template_id_08b2d1b5_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecsPropTeleport.vue?vue&type=template&id=08b2d1b5&scoped=true& */ "./src/app/ui/ecs/ecsPropTeleport.vue?vue&type=template&id=08b2d1b5&scoped=true&");
/* harmony import */ var _ecsPropTeleport_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ecsPropTeleport.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/ecsPropTeleport.vue?vue&type=script&lang=ts&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _ecsPropTeleport_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _ecsPropTeleport_vue_vue_type_template_id_08b2d1b5_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _ecsPropTeleport_vue_vue_type_template_id_08b2d1b5_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "08b2d1b5",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/ecsPropTeleport.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/ecsTransform.vue":
/*!*****************************************!*\
  !*** ./src/app/ui/ecs/ecsTransform.vue ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecsTransform_vue_vue_type_template_id_4ee87bf5_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecsTransform.vue?vue&type=template&id=4ee87bf5&scoped=true& */ "./src/app/ui/ecs/ecsTransform.vue?vue&type=template&id=4ee87bf5&scoped=true&");
/* harmony import */ var _ecsTransform_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ecsTransform.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/ecsTransform.vue?vue&type=script&lang=ts&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _ecsTransform_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _ecsTransform_vue_vue_type_template_id_4ee87bf5_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _ecsTransform_vue_vue_type_template_id_4ee87bf5_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "4ee87bf5",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/ecsTransform.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/ecsWall.vue":
/*!************************************!*\
  !*** ./src/app/ui/ecs/ecsWall.vue ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ecsWall_vue_vue_type_template_id_37e22e5e_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecsWall.vue?vue&type=template&id=37e22e5e&scoped=true& */ "./src/app/ui/ecs/ecsWall.vue?vue&type=template&id=37e22e5e&scoped=true&");
/* harmony import */ var _ecsWall_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ecsWall.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/ecsWall.vue?vue&type=script&lang=ts&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _ecsWall_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _ecsWall_vue_vue_type_template_id_37e22e5e_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _ecsWall_vue_vue_type_template_id_37e22e5e_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "37e22e5e",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/ecsWall.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/entityInspect.vue":
/*!******************************************!*\
  !*** ./src/app/ui/ecs/entityInspect.vue ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _entityInspect_vue_vue_type_template_id_c407dbfa_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entityInspect.vue?vue&type=template&id=c407dbfa&scoped=true& */ "./src/app/ui/ecs/entityInspect.vue?vue&type=template&id=c407dbfa&scoped=true&");
/* harmony import */ var _entityInspect_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./entityInspect.vue?vue&type=script&lang=ts& */ "./src/app/ui/ecs/entityInspect.vue?vue&type=script&lang=ts&");
/* harmony import */ var _entityInspect_vue_vue_type_style_index_0_id_c407dbfa_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./entityInspect.vue?vue&type=style&index=0&id=c407dbfa&scoped=true&lang=css& */ "./src/app/ui/ecs/entityInspect.vue?vue&type=style&index=0&id=c407dbfa&scoped=true&lang=css&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");



;


/* normalize component */

var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__.default)(
  _entityInspect_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _entityInspect_vue_vue_type_template_id_c407dbfa_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _entityInspect_vue_vue_type_template_id_c407dbfa_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "c407dbfa",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/ecs/entityInspect.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/edit/editMap.vue":
/*!*************************************!*\
  !*** ./src/app/ui/edit/editMap.vue ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _editMap_vue_vue_type_template_id_53b46051_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./editMap.vue?vue&type=template&id=53b46051&scoped=true& */ "./src/app/ui/edit/editMap.vue?vue&type=template&id=53b46051&scoped=true&");
/* harmony import */ var _editMap_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./editMap.vue?vue&type=script&lang=ts& */ "./src/app/ui/edit/editMap.vue?vue&type=script&lang=ts&");
/* harmony import */ var _editMap_vue_vue_type_style_index_0_id_53b46051_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./editMap.vue?vue&type=style&index=0&id=53b46051&scoped=true&lang=css& */ "./src/app/ui/edit/editMap.vue?vue&type=style&index=0&id=53b46051&scoped=true&lang=css&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");



;


/* normalize component */

var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__.default)(
  _editMap_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _editMap_vue_vue_type_template_id_53b46051_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _editMap_vue_vue_type_template_id_53b46051_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "53b46051",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/edit/editMap.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/edit/gridEdit.vue":
/*!**************************************!*\
  !*** ./src/app/ui/edit/gridEdit.vue ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _gridEdit_vue_vue_type_template_id_69e6e221___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gridEdit.vue?vue&type=template&id=69e6e221& */ "./src/app/ui/edit/gridEdit.vue?vue&type=template&id=69e6e221&");
/* harmony import */ var _gridEdit_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gridEdit.vue?vue&type=script&lang=ts& */ "./src/app/ui/edit/gridEdit.vue?vue&type=script&lang=ts&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _gridEdit_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _gridEdit_vue_vue_type_template_id_69e6e221___WEBPACK_IMPORTED_MODULE_0__.render,
  _gridEdit_vue_vue_type_template_id_69e6e221___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/edit/gridEdit.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/footer.vue":
/*!*******************************!*\
  !*** ./src/app/ui/footer.vue ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _footer_vue_vue_type_template_id_539f2bff_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./footer.vue?vue&type=template&id=539f2bff&scoped=true& */ "./src/app/ui/footer.vue?vue&type=template&id=539f2bff&scoped=true&");
/* harmony import */ var _footer_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./footer.vue?vue&type=script&lang=ts& */ "./src/app/ui/footer.vue?vue&type=script&lang=ts&");
/* harmony import */ var _footer_vue_vue_type_style_index_0_id_539f2bff_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./footer.vue?vue&type=style&index=0&id=539f2bff&scoped=true&lang=css& */ "./src/app/ui/footer.vue?vue&type=style&index=0&id=539f2bff&scoped=true&lang=css&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");



;


/* normalize component */

var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__.default)(
  _footer_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _footer_vue_vue_type_template_id_539f2bff_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _footer_vue_vue_type_template_id_539f2bff_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "539f2bff",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/footer.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/home/home.vue":
/*!**********************************!*\
  !*** ./src/app/ui/home/home.vue ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _home_vue_vue_type_template_id_d8550b4a___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./home.vue?vue&type=template&id=d8550b4a& */ "./src/app/ui/home/home.vue?vue&type=template&id=d8550b4a&");
/* harmony import */ var _home_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./home.vue?vue&type=script&lang=ts& */ "./src/app/ui/home/home.vue?vue&type=script&lang=ts&");
/* harmony import */ var _home_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./home.vue?vue&type=style&index=0&lang=css& */ "./src/app/ui/home/home.vue?vue&type=style&index=0&lang=css&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");



;


/* normalize component */

var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__.default)(
  _home_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _home_vue_vue_type_template_id_d8550b4a___WEBPACK_IMPORTED_MODULE_0__.render,
  _home_vue_vue_type_template_id_d8550b4a___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/home/home.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/home/mapInput.vue":
/*!**************************************!*\
  !*** ./src/app/ui/home/mapInput.vue ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _mapInput_vue_vue_type_template_id_7e9d406c_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mapInput.vue?vue&type=template&id=7e9d406c&scoped=true& */ "./src/app/ui/home/mapInput.vue?vue&type=template&id=7e9d406c&scoped=true&");
/* harmony import */ var _mapInput_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mapInput.vue?vue&type=script&lang=js& */ "./src/app/ui/home/mapInput.vue?vue&type=script&lang=js&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _mapInput_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__.default,
  _mapInput_vue_vue_type_template_id_7e9d406c_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render,
  _mapInput_vue_vue_type_template_id_7e9d406c_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "7e9d406c",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/home/mapInput.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/mapInput.vue?vue&type=script&lang=js&":
/*!**************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/mapInput.vue?vue&type=script&lang=js& ***!
  \**************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    name: "mapInput",
    data() {
        return {
            file: null,
        }
    },
    methods: {
        onDrop: function (event) {

        },
        hideModal: function (event) {
          this.$emit("close");
        }
    }
});


/***/ }),

/***/ "./src/app/ui/loading/loading.vue":
/*!****************************************!*\
  !*** ./src/app/ui/loading/loading.vue ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _loading_vue_vue_type_template_id_b10af496___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./loading.vue?vue&type=template&id=b10af496& */ "./src/app/ui/loading/loading.vue?vue&type=template&id=b10af496&");
/* harmony import */ var _loading_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./loading.vue?vue&type=script&lang=ts& */ "./src/app/ui/loading/loading.vue?vue&type=script&lang=ts&");
/* harmony import */ var _loading_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./loading.vue?vue&type=style&index=0&lang=css& */ "./src/app/ui/loading/loading.vue?vue&type=style&index=0&lang=css&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");



;


/* normalize component */

var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__.default)(
  _loading_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__.default,
  _loading_vue_vue_type_template_id_b10af496___WEBPACK_IMPORTED_MODULE_0__.render,
  _loading_vue_vue_type_template_id_b10af496___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/app/ui/loading/loading.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./src/app/ui/ecs/compWrapper.vue?vue&type=script&lang=ts&":
/*!*****************************************************************!*\
  !*** ./src/app/ui/ecs/compWrapper.vue?vue&type=script&lang=ts& ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_compWrapper_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./compWrapper.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/compWrapper.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_compWrapper_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/ecsBackgroundImage.vue?vue&type=script&lang=ts&":
/*!************************************************************************!*\
  !*** ./src/app/ui/ecs/ecsBackgroundImage.vue?vue&type=script&lang=ts& ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsBackgroundImage_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsBackgroundImage.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsBackgroundImage.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsBackgroundImage_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/ecsDoor.vue?vue&type=script&lang=ts&":
/*!*************************************************************!*\
  !*** ./src/app/ui/ecs/ecsDoor.vue?vue&type=script&lang=ts& ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsDoor_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsDoor.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsDoor.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsDoor_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/ecsLight.vue?vue&type=script&lang=ts&":
/*!**************************************************************!*\
  !*** ./src/app/ui/ecs/ecsLight.vue?vue&type=script&lang=ts& ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsLight_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsLight.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsLight.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsLight_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/ecsName.vue?vue&type=script&lang=ts&":
/*!*************************************************************!*\
  !*** ./src/app/ui/ecs/ecsName.vue?vue&type=script&lang=ts& ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsName_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsName.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsName.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsName_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/ecsNote.vue?vue&type=script&lang=ts&":
/*!*************************************************************!*\
  !*** ./src/app/ui/ecs/ecsNote.vue?vue&type=script&lang=ts& ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsNote_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsNote.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsNote.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsNote_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/ecsPin.vue?vue&type=script&lang=ts&":
/*!************************************************************!*\
  !*** ./src/app/ui/ecs/ecsPin.vue?vue&type=script&lang=ts& ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPin_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsPin.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPin.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPin_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/ecsPlayer.vue?vue&type=script&lang=ts&":
/*!***************************************************************!*\
  !*** ./src/app/ui/ecs/ecsPlayer.vue?vue&type=script&lang=ts& ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPlayer_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsPlayer.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPlayer.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPlayer_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/ecsPosition.vue?vue&type=script&lang=ts&":
/*!*****************************************************************!*\
  !*** ./src/app/ui/ecs/ecsPosition.vue?vue&type=script&lang=ts& ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPosition_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsPosition.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPosition.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPosition_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/ecsPropTeleport.vue?vue&type=script&lang=ts&":
/*!*********************************************************************!*\
  !*** ./src/app/ui/ecs/ecsPropTeleport.vue?vue&type=script&lang=ts& ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPropTeleport_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsPropTeleport.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPropTeleport.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPropTeleport_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/ecsTransform.vue?vue&type=script&lang=ts&":
/*!******************************************************************!*\
  !*** ./src/app/ui/ecs/ecsTransform.vue?vue&type=script&lang=ts& ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsTransform_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsTransform.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsTransform.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsTransform_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/ecsWall.vue?vue&type=script&lang=ts&":
/*!*************************************************************!*\
  !*** ./src/app/ui/ecs/ecsWall.vue?vue&type=script&lang=ts& ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsWall_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsWall.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsWall.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsWall_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/entityInspect.vue?vue&type=script&lang=ts&":
/*!*******************************************************************!*\
  !*** ./src/app/ui/ecs/entityInspect.vue?vue&type=script&lang=ts& ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_entityInspect_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./entityInspect.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/entityInspect.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_entityInspect_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/edit/editMap.vue?vue&type=script&lang=ts&":
/*!**************************************************************!*\
  !*** ./src/app/ui/edit/editMap.vue?vue&type=script&lang=ts& ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_editMap_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./editMap.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/editMap.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_editMap_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/edit/gridEdit.vue?vue&type=script&lang=ts&":
/*!***************************************************************!*\
  !*** ./src/app/ui/edit/gridEdit.vue?vue&type=script&lang=ts& ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_gridEdit_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./gridEdit.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/gridEdit.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_gridEdit_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/footer.vue?vue&type=script&lang=ts&":
/*!********************************************************!*\
  !*** ./src/app/ui/footer.vue?vue&type=script&lang=ts& ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./footer.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/footer.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/home/home.vue?vue&type=script&lang=ts&":
/*!***********************************************************!*\
  !*** ./src/app/ui/home/home.vue?vue&type=script&lang=ts& ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_home_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./home.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/home.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_home_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/loading/loading.vue?vue&type=script&lang=ts&":
/*!*****************************************************************!*\
  !*** ./src/app/ui/loading/loading.vue?vue&type=script&lang=ts& ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_loading_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./loading.vue?vue&type=script&lang=ts& */ "./node_modules/ts-loader/index.js??clonedRuleSet-1[0].rules[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/loading/loading.vue?vue&type=script&lang=ts&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_ts_loader_index_js_clonedRuleSet_1_0_rules_0_node_modules_vue_loader_lib_index_js_vue_loader_options_loading_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/ecs/compWrapper.vue?vue&type=template&id=03d324d6&scoped=true&":
/*!***********************************************************************************!*\
  !*** ./src/app/ui/ecs/compWrapper.vue?vue&type=template&id=03d324d6&scoped=true& ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_compWrapper_vue_vue_type_template_id_03d324d6_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_compWrapper_vue_vue_type_template_id_03d324d6_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_compWrapper_vue_vue_type_template_id_03d324d6_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./compWrapper.vue?vue&type=template&id=03d324d6&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/compWrapper.vue?vue&type=template&id=03d324d6&scoped=true&");


/***/ }),

/***/ "./src/app/ui/ecs/ecsBackgroundImage.vue?vue&type=template&id=5efd7016&scoped=true&":
/*!******************************************************************************************!*\
  !*** ./src/app/ui/ecs/ecsBackgroundImage.vue?vue&type=template&id=5efd7016&scoped=true& ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsBackgroundImage_vue_vue_type_template_id_5efd7016_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsBackgroundImage_vue_vue_type_template_id_5efd7016_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsBackgroundImage_vue_vue_type_template_id_5efd7016_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsBackgroundImage.vue?vue&type=template&id=5efd7016&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsBackgroundImage.vue?vue&type=template&id=5efd7016&scoped=true&");


/***/ }),

/***/ "./src/app/ui/ecs/ecsDoor.vue?vue&type=template&id=1862e8b5&scoped=true&":
/*!*******************************************************************************!*\
  !*** ./src/app/ui/ecs/ecsDoor.vue?vue&type=template&id=1862e8b5&scoped=true& ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsDoor_vue_vue_type_template_id_1862e8b5_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsDoor_vue_vue_type_template_id_1862e8b5_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsDoor_vue_vue_type_template_id_1862e8b5_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsDoor.vue?vue&type=template&id=1862e8b5&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsDoor.vue?vue&type=template&id=1862e8b5&scoped=true&");


/***/ }),

/***/ "./src/app/ui/ecs/ecsLight.vue?vue&type=template&id=724e011f&scoped=true&":
/*!********************************************************************************!*\
  !*** ./src/app/ui/ecs/ecsLight.vue?vue&type=template&id=724e011f&scoped=true& ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsLight_vue_vue_type_template_id_724e011f_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsLight_vue_vue_type_template_id_724e011f_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsLight_vue_vue_type_template_id_724e011f_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsLight.vue?vue&type=template&id=724e011f&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsLight.vue?vue&type=template&id=724e011f&scoped=true&");


/***/ }),

/***/ "./src/app/ui/ecs/ecsName.vue?vue&type=template&id=3e768912&scoped=true&":
/*!*******************************************************************************!*\
  !*** ./src/app/ui/ecs/ecsName.vue?vue&type=template&id=3e768912&scoped=true& ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsName_vue_vue_type_template_id_3e768912_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsName_vue_vue_type_template_id_3e768912_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsName_vue_vue_type_template_id_3e768912_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsName.vue?vue&type=template&id=3e768912&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsName.vue?vue&type=template&id=3e768912&scoped=true&");


/***/ }),

/***/ "./src/app/ui/ecs/ecsNote.vue?vue&type=template&id=2effb2f9&scoped=true&":
/*!*******************************************************************************!*\
  !*** ./src/app/ui/ecs/ecsNote.vue?vue&type=template&id=2effb2f9&scoped=true& ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsNote_vue_vue_type_template_id_2effb2f9_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsNote_vue_vue_type_template_id_2effb2f9_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsNote_vue_vue_type_template_id_2effb2f9_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsNote.vue?vue&type=template&id=2effb2f9&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsNote.vue?vue&type=template&id=2effb2f9&scoped=true&");


/***/ }),

/***/ "./src/app/ui/ecs/ecsPin.vue?vue&type=template&id=26d88e5e&scoped=true&":
/*!******************************************************************************!*\
  !*** ./src/app/ui/ecs/ecsPin.vue?vue&type=template&id=26d88e5e&scoped=true& ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPin_vue_vue_type_template_id_26d88e5e_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPin_vue_vue_type_template_id_26d88e5e_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPin_vue_vue_type_template_id_26d88e5e_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsPin.vue?vue&type=template&id=26d88e5e&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPin.vue?vue&type=template&id=26d88e5e&scoped=true&");


/***/ }),

/***/ "./src/app/ui/ecs/ecsPlayer.vue?vue&type=template&id=636ceea8&scoped=true&":
/*!*********************************************************************************!*\
  !*** ./src/app/ui/ecs/ecsPlayer.vue?vue&type=template&id=636ceea8&scoped=true& ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPlayer_vue_vue_type_template_id_636ceea8_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPlayer_vue_vue_type_template_id_636ceea8_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPlayer_vue_vue_type_template_id_636ceea8_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsPlayer.vue?vue&type=template&id=636ceea8&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPlayer.vue?vue&type=template&id=636ceea8&scoped=true&");


/***/ }),

/***/ "./src/app/ui/ecs/ecsPosition.vue?vue&type=template&id=e81e4da0&scoped=true&":
/*!***********************************************************************************!*\
  !*** ./src/app/ui/ecs/ecsPosition.vue?vue&type=template&id=e81e4da0&scoped=true& ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPosition_vue_vue_type_template_id_e81e4da0_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPosition_vue_vue_type_template_id_e81e4da0_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPosition_vue_vue_type_template_id_e81e4da0_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsPosition.vue?vue&type=template&id=e81e4da0&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPosition.vue?vue&type=template&id=e81e4da0&scoped=true&");


/***/ }),

/***/ "./src/app/ui/ecs/ecsPropTeleport.vue?vue&type=template&id=08b2d1b5&scoped=true&":
/*!***************************************************************************************!*\
  !*** ./src/app/ui/ecs/ecsPropTeleport.vue?vue&type=template&id=08b2d1b5&scoped=true& ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPropTeleport_vue_vue_type_template_id_08b2d1b5_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPropTeleport_vue_vue_type_template_id_08b2d1b5_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsPropTeleport_vue_vue_type_template_id_08b2d1b5_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsPropTeleport.vue?vue&type=template&id=08b2d1b5&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPropTeleport.vue?vue&type=template&id=08b2d1b5&scoped=true&");


/***/ }),

/***/ "./src/app/ui/ecs/ecsTransform.vue?vue&type=template&id=4ee87bf5&scoped=true&":
/*!************************************************************************************!*\
  !*** ./src/app/ui/ecs/ecsTransform.vue?vue&type=template&id=4ee87bf5&scoped=true& ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsTransform_vue_vue_type_template_id_4ee87bf5_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsTransform_vue_vue_type_template_id_4ee87bf5_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsTransform_vue_vue_type_template_id_4ee87bf5_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsTransform.vue?vue&type=template&id=4ee87bf5&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsTransform.vue?vue&type=template&id=4ee87bf5&scoped=true&");


/***/ }),

/***/ "./src/app/ui/ecs/ecsWall.vue?vue&type=template&id=37e22e5e&scoped=true&":
/*!*******************************************************************************!*\
  !*** ./src/app/ui/ecs/ecsWall.vue?vue&type=template&id=37e22e5e&scoped=true& ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsWall_vue_vue_type_template_id_37e22e5e_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsWall_vue_vue_type_template_id_37e22e5e_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_ecsWall_vue_vue_type_template_id_37e22e5e_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./ecsWall.vue?vue&type=template&id=37e22e5e&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsWall.vue?vue&type=template&id=37e22e5e&scoped=true&");


/***/ }),

/***/ "./src/app/ui/ecs/entityInspect.vue?vue&type=template&id=c407dbfa&scoped=true&":
/*!*************************************************************************************!*\
  !*** ./src/app/ui/ecs/entityInspect.vue?vue&type=template&id=c407dbfa&scoped=true& ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_entityInspect_vue_vue_type_template_id_c407dbfa_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_entityInspect_vue_vue_type_template_id_c407dbfa_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_entityInspect_vue_vue_type_template_id_c407dbfa_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./entityInspect.vue?vue&type=template&id=c407dbfa&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/entityInspect.vue?vue&type=template&id=c407dbfa&scoped=true&");


/***/ }),

/***/ "./src/app/ui/edit/editMap.vue?vue&type=template&id=53b46051&scoped=true&":
/*!********************************************************************************!*\
  !*** ./src/app/ui/edit/editMap.vue?vue&type=template&id=53b46051&scoped=true& ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_editMap_vue_vue_type_template_id_53b46051_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_editMap_vue_vue_type_template_id_53b46051_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_editMap_vue_vue_type_template_id_53b46051_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./editMap.vue?vue&type=template&id=53b46051&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/editMap.vue?vue&type=template&id=53b46051&scoped=true&");


/***/ }),

/***/ "./src/app/ui/edit/gridEdit.vue?vue&type=template&id=69e6e221&":
/*!*********************************************************************!*\
  !*** ./src/app/ui/edit/gridEdit.vue?vue&type=template&id=69e6e221& ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_gridEdit_vue_vue_type_template_id_69e6e221___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_gridEdit_vue_vue_type_template_id_69e6e221___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_gridEdit_vue_vue_type_template_id_69e6e221___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./gridEdit.vue?vue&type=template&id=69e6e221& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/gridEdit.vue?vue&type=template&id=69e6e221&");


/***/ }),

/***/ "./src/app/ui/footer.vue?vue&type=template&id=539f2bff&scoped=true&":
/*!**************************************************************************!*\
  !*** ./src/app/ui/footer.vue?vue&type=template&id=539f2bff&scoped=true& ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_template_id_539f2bff_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_template_id_539f2bff_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_template_id_539f2bff_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./footer.vue?vue&type=template&id=539f2bff&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/footer.vue?vue&type=template&id=539f2bff&scoped=true&");


/***/ }),

/***/ "./src/app/ui/home/home.vue?vue&type=template&id=d8550b4a&":
/*!*****************************************************************!*\
  !*** ./src/app/ui/home/home.vue?vue&type=template&id=d8550b4a& ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_home_vue_vue_type_template_id_d8550b4a___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_home_vue_vue_type_template_id_d8550b4a___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_home_vue_vue_type_template_id_d8550b4a___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./home.vue?vue&type=template&id=d8550b4a& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/home.vue?vue&type=template&id=d8550b4a&");


/***/ }),

/***/ "./src/app/ui/home/mapInput.vue?vue&type=script&lang=js&":
/*!***************************************************************!*\
  !*** ./src/app/ui/home/mapInput.vue?vue&type=script&lang=js& ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_index_js_vue_loader_options_mapInput_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./mapInput.vue?vue&type=script&lang=js& */ "./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/mapInput.vue?vue&type=script&lang=js&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_vue_loader_lib_index_js_vue_loader_options_mapInput_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./src/app/ui/home/mapInput.vue?vue&type=template&id=7e9d406c&scoped=true&":
/*!*********************************************************************************!*\
  !*** ./src/app/ui/home/mapInput.vue?vue&type=template&id=7e9d406c&scoped=true& ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_mapInput_vue_vue_type_template_id_7e9d406c_scoped_true___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_mapInput_vue_vue_type_template_id_7e9d406c_scoped_true___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_mapInput_vue_vue_type_template_id_7e9d406c_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./mapInput.vue?vue&type=template&id=7e9d406c&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/mapInput.vue?vue&type=template&id=7e9d406c&scoped=true&");


/***/ }),

/***/ "./src/app/ui/loading/loading.vue?vue&type=template&id=b10af496&":
/*!***********************************************************************!*\
  !*** ./src/app/ui/loading/loading.vue?vue&type=template&id=b10af496& ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_loading_vue_vue_type_template_id_b10af496___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_loading_vue_vue_type_template_id_b10af496___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_loading_vue_vue_type_template_id_b10af496___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./loading.vue?vue&type=template&id=b10af496& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/loading/loading.vue?vue&type=template&id=b10af496&");


/***/ }),

/***/ "./src/app/ui/ecs/compWrapper.vue?vue&type=style&index=0&id=03d324d6&scoped=true&lang=css&":
/*!*************************************************************************************************!*\
  !*** ./src/app/ui/ecs/compWrapper.vue?vue&type=style&index=0&id=03d324d6&scoped=true&lang=css& ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_compWrapper_vue_vue_type_style_index_0_id_03d324d6_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-style-loader/index.js!../../../../node_modules/css-loader/dist/cjs.js!../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./compWrapper.vue?vue&type=style&index=0&id=03d324d6&scoped=true&lang=css& */ "./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/compWrapper.vue?vue&type=style&index=0&id=03d324d6&scoped=true&lang=css&");
/* harmony import */ var _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_compWrapper_vue_vue_type_style_index_0_id_03d324d6_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_compWrapper_vue_vue_type_style_index_0_id_03d324d6_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_compWrapper_vue_vue_type_style_index_0_id_03d324d6_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_compWrapper_vue_vue_type_style_index_0_id_03d324d6_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);


/***/ }),

/***/ "./src/app/ui/ecs/entityInspect.vue?vue&type=style&index=0&id=c407dbfa&scoped=true&lang=css&":
/*!***************************************************************************************************!*\
  !*** ./src/app/ui/ecs/entityInspect.vue?vue&type=style&index=0&id=c407dbfa&scoped=true&lang=css& ***!
  \***************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_entityInspect_vue_vue_type_style_index_0_id_c407dbfa_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-style-loader/index.js!../../../../node_modules/css-loader/dist/cjs.js!../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./entityInspect.vue?vue&type=style&index=0&id=c407dbfa&scoped=true&lang=css& */ "./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/entityInspect.vue?vue&type=style&index=0&id=c407dbfa&scoped=true&lang=css&");
/* harmony import */ var _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_entityInspect_vue_vue_type_style_index_0_id_c407dbfa_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_entityInspect_vue_vue_type_style_index_0_id_c407dbfa_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_entityInspect_vue_vue_type_style_index_0_id_c407dbfa_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_entityInspect_vue_vue_type_style_index_0_id_c407dbfa_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);


/***/ }),

/***/ "./src/app/ui/edit/editMap.vue?vue&type=style&index=0&id=53b46051&scoped=true&lang=css&":
/*!**********************************************************************************************!*\
  !*** ./src/app/ui/edit/editMap.vue?vue&type=style&index=0&id=53b46051&scoped=true&lang=css& ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_editMap_vue_vue_type_style_index_0_id_53b46051_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-style-loader/index.js!../../../../node_modules/css-loader/dist/cjs.js!../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./editMap.vue?vue&type=style&index=0&id=53b46051&scoped=true&lang=css& */ "./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/editMap.vue?vue&type=style&index=0&id=53b46051&scoped=true&lang=css&");
/* harmony import */ var _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_editMap_vue_vue_type_style_index_0_id_53b46051_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_editMap_vue_vue_type_style_index_0_id_53b46051_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_editMap_vue_vue_type_style_index_0_id_53b46051_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_editMap_vue_vue_type_style_index_0_id_53b46051_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);


/***/ }),

/***/ "./src/app/ui/footer.vue?vue&type=style&index=0&id=539f2bff&scoped=true&lang=css&":
/*!****************************************************************************************!*\
  !*** ./src/app/ui/footer.vue?vue&type=style&index=0&id=539f2bff&scoped=true&lang=css& ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_style_index_0_id_539f2bff_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/vue-style-loader/index.js!../../../node_modules/css-loader/dist/cjs.js!../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./footer.vue?vue&type=style&index=0&id=539f2bff&scoped=true&lang=css& */ "./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/footer.vue?vue&type=style&index=0&id=539f2bff&scoped=true&lang=css&");
/* harmony import */ var _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_style_index_0_id_539f2bff_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_style_index_0_id_539f2bff_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_style_index_0_id_539f2bff_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_style_index_0_id_539f2bff_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);


/***/ }),

/***/ "./src/app/ui/home/home.vue?vue&type=style&index=0&lang=css&":
/*!*******************************************************************!*\
  !*** ./src/app/ui/home/home.vue?vue&type=style&index=0&lang=css& ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_home_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-style-loader/index.js!../../../../node_modules/css-loader/dist/cjs.js!../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./home.vue?vue&type=style&index=0&lang=css& */ "./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/home.vue?vue&type=style&index=0&lang=css&");
/* harmony import */ var _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_home_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_home_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_home_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_home_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);


/***/ }),

/***/ "./src/app/ui/loading/loading.vue?vue&type=style&index=0&lang=css&":
/*!*************************************************************************!*\
  !*** ./src/app/ui/loading/loading.vue?vue&type=style&index=0&lang=css& ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_loading_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-style-loader/index.js!../../../../node_modules/css-loader/dist/cjs.js!../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./loading.vue?vue&type=style&index=0&lang=css& */ "./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/loading/loading.vue?vue&type=style&index=0&lang=css&");
/* harmony import */ var _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_loading_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_loading_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_loading_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _node_modules_vue_style_loader_index_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_loading_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);


/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/compWrapper.vue?vue&type=template&id=03d324d6&scoped=true&":
/*!**************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/compWrapper.vue?vue&type=template&id=03d324d6&scoped=true& ***!
  \**************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c("div", [
        _c(
          "div",
          { staticClass: "component-header" },
          [
            _c(
              "div",
              {
                staticStyle: { width: "100%" },
                on: {
                  click: function($event) {
                    _vm.visible = !_vm.visible
                  }
                }
              },
              [_vm._v(" " + _vm._s(_vm.component.type))]
            ),
            _vm._v(" "),
            _vm.isAdmin
              ? _c(
                  "b-button",
                  {
                    directives: [
                      {
                        name: "show",
                        rawName: "v-show",
                        value: _vm.component.clientVisible !== undefined,
                        expression: "component.clientVisible !== undefined"
                      }
                    ],
                    staticStyle: { display: "grid" },
                    attrs: {
                      squared: "",
                      size: "sm",
                      title: _vm.component.clientVisible
                        ? "Hide component"
                        : "Show component"
                    },
                    on: {
                      click: function($event) {
                        return _vm.$emit(
                          "ecs-property-change",
                          _vm.component.type,
                          "clientVisible",
                          !_vm.component.clientVisible
                        )
                      }
                    }
                  },
                  [
                    _c(
                      "div",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.component.clientVisible,
                            expression: "component.clientVisible"
                          }
                        ],
                        staticClass: "g11"
                      },
                      [_c("i", { staticClass: "fas fa-eye" })]
                    ),
                    _vm._v(" "),
                    _c(
                      "div",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: !_vm.component.clientVisible,
                            expression: "!component.clientVisible"
                          }
                        ],
                        staticClass: "g11"
                      },
                      [_c("i", { staticClass: "fas fa-eye-slash" })]
                    )
                  ]
                )
              : _vm._e(),
            _vm._v(" "),
            _vm.isAdmin
              ? _c(
                  "b-button",
                  {
                    directives: [
                      {
                        name: "show",
                        rawName: "v-show",
                        value: _vm.component._isFullscreen !== undefined,
                        expression: "component._isFullscreen !== undefined"
                      }
                    ],
                    attrs: {
                      squared: "",
                      size: "sm",
                      variant: "primary",
                      title: "Fullscreen"
                    },
                    on: {
                      click: function($event) {
                        _vm.component._isFullscreen = true
                      }
                    }
                  },
                  [_c("i", { staticClass: "fas fa-expand" })]
                )
              : _vm._e(),
            _vm._v(" "),
            _vm.isAdmin
              ? _c(
                  "b-button",
                  {
                    directives: [
                      {
                        name: "show",
                        rawName: "v-show",
                        value: _vm.component._canDelete,
                        expression: "component._canDelete"
                      }
                    ],
                    attrs: {
                      squared: "",
                      size: "sm",
                      variant: "danger",
                      title: "Delete"
                    },
                    on: {
                      click: function($event) {
                        return _vm.$emit(
                          "ecs-property-change",
                          "$",
                          "removeComponent",
                          _vm.component.type,
                          _vm.component.multiId
                        )
                      }
                    }
                  },
                  [_c("i", { staticClass: "fas fa-trash" })]
                )
              : _vm._e()
          ],
          1
        )
      ]),
      _vm._v(" "),
      _c(
        "b-collapse",
        {
          staticClass: "component-body",
          attrs: { visible: "" },
          model: {
            value: _vm.visible,
            callback: function($$v) {
              _vm.visible = $$v
            },
            expression: "visible"
          }
        },
        [
          _c(_vm.componentType, {
            tag: "component",
            attrs: {
              component: _vm.component,
              isAdmin: _vm.isAdmin,
              allComps: _vm.allComps
            },
            on: {
              "ecs-property-change": function($event) {
                return _vm.$emit(
                  "ecs-property-change",
                  arguments[0],
                  arguments[1],
                  arguments[2],
                  arguments[3]
                )
              }
            }
          })
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsBackgroundImage.vue?vue&type=template&id=5efd7016&scoped=true&":
/*!*********************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsBackgroundImage.vue?vue&type=template&id=5efd7016&scoped=true& ***!
  \*********************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("span", [_vm._v("Your regular background image")])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsDoor.vue?vue&type=template&id=1862e8b5&scoped=true&":
/*!**********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsDoor.vue?vue&type=template&id=1862e8b5&scoped=true& ***!
  \**********************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      [
        _vm._v("\n    Type:\n    "),
        !_vm.isAdmin
          ? _c("span", [
              _vm._v("\n      " + _vm._s(this.doorTypeName) + "\n    ")
            ])
          : _vm._e(),
        _vm._v(" "),
        _vm.isAdmin
          ? _c(
              "b-form-select",
              {
                staticClass: "mb-3",
                model: {
                  value: _vm.doorType,
                  callback: function($$v) {
                    _vm.doorType = $$v
                  },
                  expression: "doorType"
                }
              },
              [
                _c("b-form-select-option", { attrs: { value: "normall" } }, [
                  _vm._v("Normal")
                ]),
                _vm._v(" "),
                _c("b-form-select-option", { attrs: { value: "normalr" } }, [
                  _vm._v("Normal right")
                ]),
                _vm._v(" "),
                _c("b-form-select-option", { attrs: { value: "rotate" } }, [
                  _vm._v("Rotating")
                ])
              ],
              1
            )
          : _vm._e()
      ],
      1
    ),
    _vm._v(" "),
    _c(
      "div",
      { staticStyle: { display: "flex", "align-items": "center" } },
      [
        !_vm.isAdmin
          ? _c("span", [_vm._v(_vm._s(_vm.open ? "Open" : "Closed"))])
          : _vm._e(),
        _vm._v(" "),
        !_vm.isAdmin
          ? _c(
              "span",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: this.locked,
                    expression: "this.locked"
                  }
                ],
                staticStyle: { "margin-left": "0.5rem" }
              },
              [_c("i", { staticClass: "fas fa-lock" })]
            )
          : _vm._e(),
        _vm._v(" "),
        _vm.isAdmin
          ? _c(
              "b-button",
              {
                attrs: { pressed: _vm.open },
                on: {
                  "update:pressed": function($event) {
                    _vm.open = $event
                  }
                }
              },
              [_vm._v(_vm._s(_vm.open ? "Open" : "Closed"))]
            )
          : _vm._e(),
        _vm._v(" "),
        _vm.isAdmin
          ? _c(
              "b-button",
              {
                attrs: { pressed: _vm.locked },
                on: {
                  "update:pressed": function($event) {
                    _vm.locked = $event
                  }
                }
              },
              [
                _c(
                  "div",
                  {
                    directives: [
                      {
                        name: "show",
                        rawName: "v-show",
                        value: _vm.locked,
                        expression: "locked"
                      }
                    ]
                  },
                  [_c("i", { staticClass: "fas fa-lock" })]
                ),
                _vm._v(" "),
                _c(
                  "div",
                  {
                    directives: [
                      {
                        name: "show",
                        rawName: "v-show",
                        value: !_vm.locked,
                        expression: "!locked"
                      }
                    ]
                  },
                  [_c("i", { staticClass: "fas fa-lock-open" })]
                )
              ]
            )
          : _vm._e()
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsLight.vue?vue&type=template&id=724e011f&scoped=true&":
/*!***********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsLight.vue?vue&type=template&id=724e011f&scoped=true& ***!
  \***********************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      [
        _vm._v("\n    Color:\n    "),
        _vm.isAdmin
          ? _c("b-input", {
              attrs: { type: "color" },
              on: { change: _vm.onChange },
              model: {
                value: _vm.color,
                callback: function($$v) {
                  _vm.color = $$v
                },
                expression: "color"
              }
            })
          : _c("span", [_vm._v(_vm._s(_vm.color))])
      ],
      1
    ),
    _vm._v(" "),
    _c(
      "div",
      { staticStyle: { display: "flex", "align-items": "center" } },
      [
        _vm._v("\n    Visibility Range: "),
        !_vm.isAdmin
          ? _c("span", { staticStyle: { "margin-left": "0.5rem" } }, [
              _vm._v(_vm._s(_vm.range))
            ])
          : _vm._e(),
        _vm._v(" "),
        _vm.isAdmin
          ? _c("b-input", {
              attrs: { type: "number", step: "1", min: "0", size: "sm" },
              on: { change: _vm.onChange },
              model: {
                value: _vm.range,
                callback: function($$v) {
                  _vm.range = $$v
                },
                expression: "range"
              }
            })
          : _vm._e()
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsName.vue?vue&type=template&id=3e768912&scoped=true&":
/*!**********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsName.vue?vue&type=template&id=3e768912&scoped=true& ***!
  \**********************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("b-input", {
    attrs: { readonly: !_vm.isAdmin, placeholder: "Entity name" },
    on: { change: _vm.onChange },
    model: {
      value: _vm.component.name,
      callback: function($$v) {
        _vm.$set(_vm.component, "name", $$v)
      },
      expression: "component.name"
    }
  })
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsNote.vue?vue&type=template&id=2effb2f9&scoped=true&":
/*!**********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsNote.vue?vue&type=template&id=2effb2f9&scoped=true& ***!
  \**********************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c("b-textarea", {
        attrs: {
          placeholder: "Write something here...",
          readonly: !_vm.isAdmin
        },
        on: { change: _vm.onChange },
        model: {
          value: _vm.note,
          callback: function($$v) {
            _vm.note = $$v
          },
          expression: "note"
        }
      }),
      _vm._v(" "),
      _c(
        "b-modal",
        {
          attrs: {
            title: "Note",
            "dialog-class": "modal-fullscreen modal-xxl",
            "hide-footer": "",
            "hide-header": ""
          },
          scopedSlots: _vm._u([
            {
              key: "modal-footer",
              fn: function() {
                return undefined
              },
              proxy: true
            }
          ]),
          model: {
            value: _vm.component._isFullscreen,
            callback: function($$v) {
              _vm.$set(_vm.component, "_isFullscreen", $$v)
            },
            expression: "component._isFullscreen"
          }
        },
        [
          _c("b-textarea", {
            staticStyle: { height: "100%", resize: "none" },
            attrs: {
              placeholder: "Write something here...",
              readonly: !_vm.isAdmin
            },
            on: { change: _vm.onChange },
            model: {
              value: _vm.note,
              callback: function($$v) {
                _vm.note = $$v
              },
              expression: "note"
            }
          })
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPin.vue?vue&type=template&id=26d88e5e&scoped=true&":
/*!*********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPin.vue?vue&type=template&id=26d88e5e&scoped=true& ***!
  \*********************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _vm.isAdmin
        ? [
            _c("b-input", {
              attrs: { type: "color", readonly: !_vm.isAdmin },
              on: { change: _vm.onChange },
              model: {
                value: _vm.color,
                callback: function($$v) {
                  _vm.color = $$v
                },
                expression: "color"
              }
            }),
            _vm._v(" "),
            _c("b-input", {
              attrs: { readonly: !_vm.isAdmin, placeholder: "Label" },
              on: { change: _vm.onChange },
              model: {
                value: _vm.label,
                callback: function($$v) {
                  _vm.label = $$v
                },
                expression: "label"
              }
            })
          ]
        : _vm._e()
    ],
    2
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPlayer.vue?vue&type=template&id=636ceea8&scoped=true&":
/*!************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPlayer.vue?vue&type=template&id=636ceea8&scoped=true& ***!
  \************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      { staticStyle: { display: "flex", "align-items": "center" } },
      [
        _vm._v("\n    Night vision:\n    "),
        _vm.isAdmin
          ? _c("b-form-checkbox", {
              on: { input: _vm.onChange },
              model: {
                value: _vm.nightVision,
                callback: function($$v) {
                  _vm.nightVision = $$v
                },
                expression: "nightVision"
              }
            })
          : _c("span", { staticStyle: { "margin-left": "0.5rem" } }, [
              _vm._v(_vm._s(_vm.nightVision ? "yes" : "no"))
            ])
      ],
      1
    ),
    _vm._v(" "),
    _c(
      "div",
      { staticStyle: { display: "flex", "align-items": "center" } },
      [
        _vm._v("\n    Visibility Range: "),
        !_vm.isAdmin
          ? _c("span", { staticStyle: { "margin-left": "0.5rem" } }, [
              _vm._v(_vm._s(_vm.range))
            ])
          : _vm._e(),
        _vm._v(" "),
        _vm.isAdmin
          ? _c("b-input", {
              attrs: { type: "number", step: "1", min: "0", size: "sm" },
              on: { change: _vm.onChange },
              model: {
                value: _vm.range,
                callback: function($$v) {
                  _vm.range = $$v
                },
                expression: "range"
              }
            })
          : _vm._e()
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPosition.vue?vue&type=template&id=e81e4da0&scoped=true&":
/*!**************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPosition.vue?vue&type=template&id=e81e4da0&scoped=true& ***!
  \**************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      { staticStyle: { display: "flex", "align-items": "center" } },
      [
        _vm._v("\n    X: "),
        !_vm.isAdmin
          ? _c("span", { staticStyle: { "margin-left": "0.5rem" } }, [
              _vm._v(_vm._s(_vm.x))
            ])
          : _vm._e(),
        _vm._v(" "),
        _vm.isAdmin
          ? _c("b-input", {
              attrs: { type: "number", step: "0.001", size: "sm" },
              on: { change: _vm.onChange },
              model: {
                value: _vm.x,
                callback: function($$v) {
                  _vm.x = $$v
                },
                expression: "x"
              }
            })
          : _vm._e()
      ],
      1
    ),
    _vm._v(" "),
    _c(
      "div",
      { staticStyle: { display: "flex", "align-items": "center" } },
      [
        _vm._v("\n    Y: "),
        !_vm.isAdmin
          ? _c("span", { staticStyle: { "margin-left": "0.5rem" } }, [
              _vm._v(" " + _vm._s(_vm.y))
            ])
          : _vm._e(),
        _vm._v(" "),
        _vm.isAdmin
          ? _c("b-input", {
              attrs: { type: "number", step: "0.001", size: "sm" },
              on: { change: _vm.onChange },
              model: {
                value: _vm.y,
                callback: function($$v) {
                  _vm.y = $$v
                },
                expression: "y"
              }
            })
          : _vm._e()
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPropTeleport.vue?vue&type=template&id=08b2d1b5&scoped=true&":
/*!******************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsPropTeleport.vue?vue&type=template&id=08b2d1b5&scoped=true& ***!
  \******************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c("div", { staticStyle: { display: "flex", "align-items": "center" } }, [
        _vm._v("\n    Target: "),
        _c("span", { on: { click: _vm.focusTarget } }, [
          _vm._v(_vm._s(this.component.targetProp))
        ])
      ]),
      _vm._v(" "),
      _c("b-button", { on: { click: _vm.link } }, [_vm._v("Link")]),
      _vm._v(" "),
      _c("b-button", { on: { click: _vm.use } }, [_vm._v("Use")])
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsTransform.vue?vue&type=template&id=4ee87bf5&scoped=true&":
/*!***************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsTransform.vue?vue&type=template&id=4ee87bf5&scoped=true& ***!
  \***************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      { staticStyle: { display: "flex", "align-items": "center" } },
      [
        _vm._v("\n    Angle: "),
        !_vm.isAdmin
          ? _c("span", { staticStyle: { "margin-left": "0.5rem" } }, [
              _vm._v(_vm._s(_vm.rotation))
            ])
          : _vm._e(),
        _vm._v(" "),
        _vm.isAdmin
          ? _c("b-input", {
              attrs: { type: "number", step: "0.001", size: "sm" },
              on: { change: _vm.onChange },
              model: {
                value: _vm.rotation,
                callback: function($$v) {
                  _vm.rotation = $$v
                },
                expression: "rotation"
              }
            })
          : _vm._e()
      ],
      1
    ),
    _vm._v(" "),
    _c(
      "div",
      { staticStyle: { display: "flex", "align-items": "center" } },
      [
        _vm._v("\n    Scale: "),
        !_vm.isAdmin
          ? _c("span", { staticStyle: { "margin-left": "0.5rem" } }, [
              _vm._v(_vm._s(_vm.scale))
            ])
          : _vm._e(),
        _vm._v(" "),
        _vm.isAdmin
          ? _c("b-input", {
              attrs: { type: "number", step: "0.001", size: "sm" },
              on: { change: _vm.onChange },
              model: {
                value: _vm.scale,
                callback: function($$v) {
                  _vm.scale = $$v
                },
                expression: "scale"
              }
            })
          : _vm._e()
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsWall.vue?vue&type=template&id=37e22e5e&scoped=true&":
/*!**********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/ecsWall.vue?vue&type=template&id=37e22e5e&scoped=true& ***!
  \**********************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      { staticStyle: { display: "flex", "align-items": "center" } },
      [
        _vm._v("\n    W: "),
        !_vm.isAdmin
          ? _c("span", { staticStyle: { "margin-left": "0.5rem" } }, [
              _vm._v(_vm._s(_vm.w))
            ])
          : _vm._e(),
        _vm._v(" "),
        _vm.isAdmin
          ? _c("b-input", {
              attrs: { type: "number", step: "0.001", size: "sm" },
              on: { change: _vm.onChange },
              model: {
                value: _vm.w,
                callback: function($$v) {
                  _vm.w = $$v
                },
                expression: "w"
              }
            })
          : _vm._e()
      ],
      1
    ),
    _vm._v(" "),
    _c(
      "div",
      { staticStyle: { display: "flex", "align-items": "center" } },
      [
        _vm._v("\n    H: "),
        !_vm.isAdmin
          ? _c("span", { staticStyle: { "margin-left": "0.5rem" } }, [
              _vm._v(_vm._s(_vm.h))
            ])
          : _vm._e(),
        _vm._v(" "),
        _vm.isAdmin
          ? _c("b-input", {
              attrs: { type: "number", step: "0.001", size: "sm" },
              on: { change: _vm.onChange },
              model: {
                value: _vm.h,
                callback: function($$v) {
                  _vm.h = $$v
                },
                expression: "h"
              }
            })
          : _vm._e()
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/entityInspect.vue?vue&type=template&id=c407dbfa&scoped=true&":
/*!****************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/entityInspect.vue?vue&type=template&id=c407dbfa&scoped=true& ***!
  \****************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.components.length > 0,
          expression: "components.length > 0"
        }
      ]
    },
    [
      _c(
        "div",
        { staticClass: "component-btn-header" },
        [
          _vm.isAdmin
            ? _c(
                "b-dropdown",
                {
                  attrs: { "toggle-class": "rounded-0", variant: "success" },
                  scopedSlots: _vm._u(
                    [
                      {
                        key: "button-content",
                        fn: function() {
                          return [_c("i", { staticClass: "fas fa-plus" })]
                        },
                        proxy: true
                      }
                    ],
                    null,
                    false,
                    1774554641
                  )
                },
                [
                  _vm._v(" "),
                  _vm._l(_vm.selectedAddable, function(x) {
                    return _c(
                      "b-dropdown-item",
                      {
                        key: x.type,
                        on: {
                          click: function($event) {
                            return _vm.emitSpecial("addComponent", x.type)
                          }
                        }
                      },
                      [_vm._v("\n        " + _vm._s(x.name) + "\n      ")]
                    )
                  })
                ],
                2
              )
            : _vm._e(),
          _vm._v(" "),
          _vm.isAdmin
            ? _c(
                "b-button",
                {
                  staticStyle: { display: "grid" },
                  attrs: {
                    squared: "",
                    title: _vm.entity.hidden ? "Show entity" : "Hide entity"
                  },
                  on: {
                    click: function($event) {
                      return _vm.emitSpecial("hidden", !_vm.entity.hidden)
                    }
                  }
                },
                [
                  _c(
                    "div",
                    {
                      staticClass: "g11",
                      style: {
                        visibility: _vm.entity.hidden ? "visible" : "hidden"
                      }
                    },
                    [_c("i", { staticClass: "fas fa-eye-slash" })]
                  ),
                  _vm._v(" "),
                  _c(
                    "div",
                    {
                      staticClass: "g11",
                      style: {
                        visibility: _vm.entity.hidden ? "hidden" : "visible"
                      }
                    },
                    [_c("i", { staticClass: "fas fa-eye" })]
                  )
                ]
              )
            : _vm._e(),
          _vm._v(" "),
          _vm.isAdmin
            ? _c(
                "b-button",
                {
                  attrs: {
                    variant: "danger",
                    title: "Delete entity",
                    squared: ""
                  },
                  on: {
                    click: function($event) {
                      return _vm.emitSpecial("delete")
                    }
                  }
                },
                [_c("i", { staticClass: "fas fa-trash" })]
              )
            : _vm._e()
        ],
        1
      ),
      _vm._v(" "),
      _vm._l(_vm.renderedComponents, function(comp) {
        return _c("ecs-component-wrapper", {
          key: comp.type + (comp.multiId || ""),
          attrs: {
            component: comp,
            isAdmin: _vm.isAdmin,
            allComps: _vm.allComponents
          },
          on: {
            "ecs-property-change": function($event) {
              return _vm.$emit(
                "ecs-property-change",
                arguments[0],
                arguments[1],
                arguments[2],
                arguments[3]
              )
            }
          }
        })
      })
    ],
    2
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/editMap.vue?vue&type=template&id=53b46051&scoped=true&":
/*!***********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/editMap.vue?vue&type=template&id=53b46051&scoped=true& ***!
  \***********************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "game" },
    [
      _c(
        "b-button-toolbar",
        {
          staticClass: "bg-dark",
          staticStyle: {
            width: "100%",
            height: "var(--topbar-height)",
            "z-index": "1000"
          },
          attrs: { type: "dark", variant: "info", justify: "" }
        },
        [
          _vm.isAdmin
            ? _c(
                "b-button-group",
                { staticStyle: { "margin-right": "2rem" } },
                [
                  _c(
                    "b-button",
                    {
                      staticClass: "toolbar-btn undo-redo-btn",
                      attrs: {
                        title: "Undo",
                        squared: "",
                        disabled: !this.canUndo
                      },
                      on: {
                        click: function($event) {
                          return _vm.undo()
                        }
                      }
                    },
                    [_c("i", { staticClass: "fas fa-undo" })]
                  ),
                  _vm._v(" "),
                  _c(
                    "b-button",
                    {
                      staticClass: "toolbar-btn undo-redo-btn",
                      attrs: {
                        title: "Redo",
                        squared: "",
                        disabled: !this.canRedo
                      },
                      on: {
                        click: function($event) {
                          return _vm.redo()
                        }
                      }
                    },
                    [_c("i", { staticClass: "fas fa-redo" })]
                  )
                ],
                1
              )
            : _vm._e(),
          _vm._v(" "),
          _c(
            "b-button-group",
            [
              _c(
                "b-button",
                {
                  staticClass: "toolbar-btn",
                  attrs: { title: "Inspect", squared: "" },
                  on: {
                    click: function($event) {
                      return _vm.changeTool("inspect")
                    }
                  }
                },
                [_c("i", { staticClass: "fas fa-hand-pointer" })]
              ),
              _vm._v(" "),
              _vm.isAdmin
                ? _c(
                    "b-button",
                    {
                      staticClass: "toolbar-btn",
                      attrs: { title: "Add wall", squared: "" },
                      on: {
                        click: function($event) {
                          return _vm.changeTool("create_wall")
                        }
                      }
                    },
                    [
                      _c(
                        "svg",
                        {
                          staticClass: "svg-inline--fa fa-w-16",
                          attrs: {
                            xmlns: "http://www.w3.org/2000/svg",
                            viewBox: "0 0 234.809 234.809",
                            "xml:space": "preserve"
                          }
                        },
                        [
                          _c("path", {
                            attrs: {
                              fill: "currentColor",
                              d:
                                "M7.5,53.988c-4.135,0-7.5-3.364-7.5-7.5V20.571c0-4.136,3.365-7.5,7.5-7.5h94.904c4.135,0,7.5,3.364,7.5,7.5v25.917\n                    c0,4.136-3.365,7.5-7.5,7.5H7.5z M227.309,53.988c4.135,0,7.5-3.364,7.5-7.5V20.571c0-4.136-3.365-7.5-7.5-7.5h-94.904\n                    c-4.135,0-7.5,3.364-7.5,7.5v25.917c0,4.136,3.365,7.5,7.5,7.5H227.309z M164.856,109.904c4.135,0,7.5-3.365,7.5-7.5V76.488\n                    c0-4.136-3.365-7.5-7.5-7.5H69.952c-4.135,0-7.5,3.364-7.5,7.5v25.917c0,4.135,3.365,7.5,7.5,7.5H164.856z M39.952,109.904\n                    c4.136,0,7.5-3.364,7.5-7.5V76.488c0-4.136-3.364-7.5-7.5-7.5H8.048c-4.136,0-7.5,3.364-7.5,7.5v25.917c0,4.136,3.364,7.5,7.5,7.5\n                    H39.952z M226.761,109.904c4.136,0,7.5-3.364,7.5-7.5V76.488c0-4.136-3.364-7.5-7.5-7.5h-31.904c-4.136,0-7.5,3.364-7.5,7.5v25.917\n                    c0,4.136,3.364,7.5,7.5,7.5H226.761z M102.404,165.821c4.135,0,7.5-3.364,7.5-7.5v-25.917c0-4.135-3.365-7.5-7.5-7.5H7.5\n                    c-4.135,0-7.5,3.365-7.5,7.5v25.917c0,4.136,3.365,7.5,7.5,7.5H102.404z M227.309,165.821c4.135,0,7.5-3.364,7.5-7.5v-25.917\n                    c0-4.135-3.365-7.5-7.5-7.5h-94.904c-4.135,0-7.5,3.365-7.5,7.5v25.917c0,4.136,3.365,7.5,7.5,7.5H227.309z M164.856,221.738\n                    c4.135,0,7.5-3.364,7.5-7.5v-25.917c0-4.136-3.365-7.5-7.5-7.5H69.952c-4.135,0-7.5,3.364-7.5,7.5v25.917c0,4.136,3.365,7.5,7.5,7.5\n                    H164.856z M39.952,221.738c4.136,0,7.5-3.364,7.5-7.5v-25.917c0-4.136-3.364-7.5-7.5-7.5H8.048c-4.136,0-7.5,3.364-7.5,7.5v25.917\n                    c0,4.136,3.364,7.5,7.5,7.5H39.952z M226.761,221.738c4.136,0,7.5-3.364,7.5-7.5v-25.917c0-4.136-3.364-7.5-7.5-7.5h-31.904\n                    c-4.136,0-7.5,3.364-7.5,7.5v25.917c0,4.136,3.364,7.5,7.5,7.5H226.761z"
                            }
                          })
                        ]
                      )
                    ]
                  )
                : _vm._e(),
              _vm._v(" "),
              _vm.isAdmin
                ? _c(
                    "b-button",
                    {
                      staticClass: "toolbar-btn",
                      attrs: { title: "Add object", squared: "" },
                      on: {
                        click: function($event) {
                          return _vm.changeTool("create_prop")
                        }
                      }
                    },
                    [_c("i", { staticClass: "fas fa-plus" })]
                  )
                : _vm._e(),
              _vm._v(" "),
              _vm.isAdmin
                ? _c(
                    "b-button",
                    {
                      staticClass: "toolbar-btn",
                      attrs: { title: "Add pin", squared: "" },
                      on: {
                        click: function($event) {
                          return _vm.changeTool("create_pin")
                        }
                      }
                    },
                    [_c("i", { staticClass: "fas fa-thumbtack" })]
                  )
                : _vm._e(),
              _vm._v(" "),
              _vm.isAdmin
                ? _c(
                    "b-button",
                    {
                      staticClass: "toolbar-btn",
                      attrs: { title: "Edit grid", squared: "" },
                      on: {
                        click: function($event) {
                          return _vm.changeTool("grid")
                        }
                      }
                    },
                    [_c("i", { staticClass: "fas fa-border-all" })]
                  )
                : _vm._e(),
              _vm._v(" "),
              _vm.isAdmin
                ? _c(
                    "b-button",
                    {
                      staticClass: "toolbar-btn",
                      attrs: { title: "Light settings", squared: "" },
                      on: {
                        click: function($event) {
                          return _vm.changeTool("light")
                        }
                      }
                    },
                    [_c("i", { staticClass: "fas fa-lightbulb" })]
                  )
                : _vm._e()
            ],
            1
          ),
          _vm._v(" "),
          _vm.isAdmin
            ? _c(
                "b-button",
                {
                  staticClass: "btn-xs",
                  attrs: {
                    title: "Export map",
                    squared: "",
                    variant: "success"
                  },
                  on: {
                    click: function($event) {
                      return _vm.phase.exportMap()
                    }
                  }
                },
                [_c("i", { staticClass: "fas fa-download" })]
              )
            : _vm._e(),
          _vm._v(" "),
          _c("div", { staticStyle: { flex: "1 1 0" } }),
          _vm._v(" "),
          _c(
            "b-button",
            {
              directives: [
                {
                  name: "b-toggle",
                  rawName: "v-b-toggle.sidebar-right",
                  modifiers: { "sidebar-right": true }
                }
              ],
              staticClass: "btn-xs",
              attrs: { title: "Toggle sidebar", variant: "warning" }
            },
            [_c("i", { staticClass: "fas fa-angle-double-right" })]
          )
        ],
        1
      ),
      _vm._v(" "),
      _c("div", {
        staticStyle: {
          width: "100%",
          height: "calc(100vh - var(--topbar-height))"
        },
        attrs: { id: "canvas-container" }
      }),
      _vm._v(" "),
      _c(
        "b-sidebar",
        {
          attrs: {
            id: "sidebar-right",
            title: "Sidebar",
            "bg-variant": "dark",
            "text-variant": "light",
            right: "",
            visible: "",
            "no-header": "",
            shadow: "",
            "sidebar-class": "under-navbar"
          },
          scopedSlots: _vm._u([
            {
              key: "footer",
              fn: function() {
                return [
                  _c("div", { staticClass: "sidebar-footer" }, [
                    _vm._v(
                      "\n        " + _vm._s(_vm.connectionCount) + "\n        "
                    ),
                    _c(
                      "div",
                      {
                        class: { rotate: _vm.connectionBuffering },
                        staticStyle: { "margin-left": "0.2rem" }
                      },
                      [_c("i", { staticClass: "fas fa-sync-alt" })]
                    )
                  ])
                ]
              },
              proxy: true
            }
          ])
        },
        [
          _c("grid-edit", {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.tool === "grid",
                expression: "tool === 'grid'"
              }
            ],
            staticClass: "px-3 py-2",
            attrs: { world: _vm.world }
          }),
          _vm._v(" "),
          _c(
            "div",
            {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: _vm.tool === "inspect",
                  expression: "tool === 'inspect'"
                }
              ]
            },
            [
              _c("entity-inspect", {
                attrs: {
                  components: this.selectedComponents,
                  entity: this.selectedEntityOpts,
                  isAdmin: _vm.isAdmin,
                  selectedAddable: _vm.selectedAddable
                },
                on: { "ecs-property-change": _vm.onEcsPropertyChange }
              })
            ],
            1
          ),
          _vm._v(" "),
          _c(
            "div",
            {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: _vm.tool === "light",
                  expression: "tool === 'light'"
                }
              ],
              staticClass: "px-3 py-2"
            },
            [
              _c(
                "div",
                { staticClass: "d-flex flex-row align-items-center" },
                [
                  _c("div", {}, [_vm._v("Light:")]),
                  _vm._v(" "),
                  _c("b-input", {
                    attrs: { type: "color", readonly: !_vm.isAdmin },
                    on: { change: _vm.onAmbientLightChange },
                    model: {
                      value: _vm.light.ambientLight,
                      callback: function($$v) {
                        _vm.$set(_vm.light, "ambientLight", $$v)
                      },
                      expression: "light.ambientLight"
                    }
                  })
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "div",
                { staticClass: "d-flex flex-row align-items-center" },
                [
                  _c("div", {}, [_vm._v("Needs light:")]),
                  _vm._v(" "),
                  _c("b-form-checkbox", {
                    attrs: { readonly: !_vm.isAdmin },
                    on: { input: _vm.onAmbientLightChange },
                    model: {
                      value: _vm.light.needsLight,
                      callback: function($$v) {
                        _vm.$set(_vm.light, "needsLight", $$v)
                      },
                      expression: "light.needsLight"
                    }
                  })
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "div",
                { staticClass: "d-flex flex-row align-items-center" },
                [
                  _c("div", {}, [_vm._v("Vision type:")]),
                  _vm._v(" "),
                  _c(
                    "b-button",
                    {
                      attrs: {
                        pressed: _vm.light.roleplayVision,
                        readonly: !_vm.isAdmin
                      },
                      on: {
                        "update:pressed": function($event) {
                          return _vm.$set(_vm.light, "roleplayVision", $event)
                        }
                      }
                    },
                    [
                      _vm._v(
                        "\n          " +
                          _vm._s(
                            _vm.light.roleplayVision ? "Roleplayer" : "Master"
                          ) +
                          "\n        "
                      )
                    ]
                  )
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "div",
                { staticClass: "d-flex flex-row align-items-center" },
                [
                  _c("div", {}, [_vm._v("Background:")]),
                  _vm._v(" "),
                  _c("b-input", {
                    attrs: { type: "color", readonly: !_vm.isAdmin },
                    on: { change: _vm.onAmbientLightChange },
                    model: {
                      value: _vm.light.background,
                      callback: function($$v) {
                        _vm.$set(_vm.light, "background", $$v)
                      },
                      expression: "light.background"
                    }
                  })
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "div",
                [
                  _c("b-button", { on: { click: _vm.onLightSettingsReset } }, [
                    _vm._v("Reset")
                  ])
                ],
                1
              )
            ]
          )
        ],
        1
      ),
      _vm._v(" "),
      _c("a", {
        staticStyle: { display: "none" },
        attrs: { id: "hidden-download-link" }
      })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/gridEdit.vue?vue&type=template&id=69e6e221&":
/*!************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/gridEdit.vue?vue&type=template&id=69e6e221& ***!
  \************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _vm._v("\n  Type:\n  "),
      _c(
        "b-radio-group",
        {
          attrs: { id: "grid-type-radio", buttons: "" },
          model: {
            value: _vm.grid.type,
            callback: function($$v) {
              _vm.$set(_vm.grid, "type", $$v)
            },
            expression: "grid.type"
          }
        },
        [
          _c("b-radio", { attrs: { value: "none" } }, [
            _c("i", { staticClass: "fas fa-border-none" })
          ]),
          _vm._v(" "),
          _c("b-radio", { attrs: { value: "square" } }, [
            _c("i", { staticClass: "far fa-square" })
          ]),
          _vm._v(" "),
          _c("b-radio", { attrs: { value: "hex" } }, [
            _c(
              "svg",
              {
                staticClass: "svg-inline--fa fa-hexagon fa-w-18",
                attrs: {
                  role: "img",
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 576 512"
                }
              },
              [
                _c("path", {
                  attrs: {
                    fill: "currentColor",
                    d:
                      "M441.5 39.8C432.9 25.1 417.1 16 400 16H176c-17.1 0-32.9 9.1-41.5 23.8l-112 192c-8.7 14.9-8.7 33.4 0 48.4l112 192c8.6 14.7 24.4 23.8 41.5 23.8h224c17.1 0 32.9-9.1 41.5-23.8l112-192c8.7-14.9 8.7-33.4 0-48.4l-112-192zM400 448H176L64 256 176 64h224l112 192-112 192z"
                  }
                })
              ]
            )
          ])
        ],
        1
      ),
      _vm._v(" "),
      _vm.grid.type !== "none"
        ? _c(
            "div",
            [
              _c("div", { staticClass: "d-flex flex-row align-items-center" }, [
                _c("div", {}, [_vm._v("Size:")]),
                _vm._v(" "),
                _c(
                  "div",
                  { staticClass: "p-2" },
                  [
                    _c("b-input", {
                      attrs: {
                        type: "number",
                        min: "10",
                        max: "512",
                        size: "sm"
                      },
                      model: {
                        value: _vm.grid.size,
                        callback: function($$v) {
                          _vm.$set(_vm.grid, "size", $$v)
                        },
                        expression: "grid.size"
                      }
                    })
                  ],
                  1
                )
              ]),
              _vm._v(" "),
              _c("b-input", {
                attrs: { type: "range", min: "10", max: "512" },
                model: {
                  value: _vm.grid.size,
                  callback: function($$v) {
                    _vm.$set(_vm.grid, "size", $$v)
                  },
                  expression: "grid.size"
                }
              }),
              _vm._v(" "),
              _c("div", { staticClass: "d-flex flex-row align-items-center" }, [
                _c("div", [_vm._v("Xoffset:")]),
                _vm._v(" "),
                _c(
                  "div",
                  { staticClass: "p-2" },
                  [
                    _c("b-input", {
                      attrs: {
                        type: "number",
                        min: "0",
                        max: "1",
                        step: "0.001",
                        size: "sm"
                      },
                      model: {
                        value: _vm.grid.offX,
                        callback: function($$v) {
                          _vm.$set(_vm.grid, "offX", $$v)
                        },
                        expression: "grid.offX"
                      }
                    })
                  ],
                  1
                )
              ]),
              _vm._v(" "),
              _c("b-input", {
                attrs: { type: "range", min: "0", max: "1", step: "0.001" },
                model: {
                  value: _vm.grid.offX,
                  callback: function($$v) {
                    _vm.$set(_vm.grid, "offX", $$v)
                  },
                  expression: "grid.offX"
                }
              }),
              _vm._v(" "),
              _c("div", { staticClass: "d-flex flex-row align-items-center" }, [
                _c("div", {}, [_vm._v("Yoffset:")]),
                _vm._v(" "),
                _c(
                  "div",
                  { staticClass: "p-2" },
                  [
                    _c("b-input", {
                      attrs: {
                        type: "number",
                        min: "0",
                        max: "1",
                        step: "0.001",
                        size: "sm"
                      },
                      model: {
                        value: _vm.grid.offY,
                        callback: function($$v) {
                          _vm.$set(_vm.grid, "offY", $$v)
                        },
                        expression: "grid.offY"
                      }
                    })
                  ],
                  1
                )
              ]),
              _vm._v(" "),
              _c("b-input", {
                attrs: { type: "range", min: "0", max: "1", step: "0.001" },
                model: {
                  value: _vm.grid.offY,
                  callback: function($$v) {
                    _vm.$set(_vm.grid, "offY", $$v)
                  },
                  expression: "grid.offY"
                }
              }),
              _vm._v("\n\n    Color: " + _vm._s(_vm.grid.color) + "\n    "),
              _c("b-input", {
                attrs: { type: "color" },
                model: {
                  value: _vm.grid.color,
                  callback: function($$v) {
                    _vm.$set(_vm.grid, "color", $$v)
                  },
                  expression: "grid.color"
                }
              }),
              _vm._v(" "),
              _c("div", { staticClass: "d-flex flex-row align-items-center" }, [
                _c("div", {}, [_vm._v("Opacity:")]),
                _vm._v(" "),
                _c(
                  "div",
                  { staticClass: "p-2" },
                  [
                    _c("b-input", {
                      attrs: {
                        type: "number",
                        min: "0",
                        max: "1",
                        step: "0.001",
                        size: "sm"
                      },
                      model: {
                        value: _vm.grid.opacity,
                        callback: function($$v) {
                          _vm.$set(_vm.grid, "opacity", $$v)
                        },
                        expression: "grid.opacity"
                      }
                    })
                  ],
                  1
                )
              ]),
              _vm._v(" "),
              _c("b-input", {
                attrs: { type: "range", min: "0", max: "1", step: "0.001" },
                model: {
                  value: _vm.grid.opacity,
                  callback: function($$v) {
                    _vm.$set(_vm.grid, "opacity", $$v)
                  },
                  expression: "grid.opacity"
                }
              }),
              _vm._v(" "),
              _c("div", { staticClass: "d-flex flex-row align-items-center" }, [
                _c("div", {}, [_vm._v("Thickness:")]),
                _vm._v(" "),
                _c(
                  "div",
                  { staticClass: "p-2" },
                  [
                    _c("b-input", {
                      attrs: {
                        type: "number",
                        min: "1",
                        max: "200",
                        size: "sm"
                      },
                      model: {
                        value: _vm.grid.thick,
                        callback: function($$v) {
                          _vm.$set(_vm.grid, "thick", $$v)
                        },
                        expression: "grid.thick"
                      }
                    })
                  ],
                  1
                )
              ]),
              _vm._v(" "),
              _c("b-input", {
                attrs: { type: "range", min: "1", max: "200" },
                model: {
                  value: _vm.grid.thick,
                  callback: function($$v) {
                    _vm.$set(_vm.grid, "thick", $$v)
                  },
                  expression: "grid.thick"
                }
              })
            ],
            1
          )
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/footer.vue?vue&type=template&id=539f2bff&scoped=true&":
/*!*****************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/footer.vue?vue&type=template&id=539f2bff&scoped=true& ***!
  \*****************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm._m(0)
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "footer" }, [
      _c("div", { staticClass: "credits" }, [
        _c("div", { staticClass: "links" }, [
          _c("a", {
            staticClass: "github",
            attrs: {
              href: "https://github.com/SnowyCoder/dndme",
              target: "_blank"
            }
          })
        ]),
        _vm._v(" "),
        _c("small", { staticStyle: { color: "lightgray" } }, [
          _vm._v("\n      Developed by "),
          _c(
            "a",
            {
              staticClass: "profile",
              attrs: { href: "https://github.com/SnowyCoder", target: "_blank" }
            },
            [_vm._v("Rossi Lorenzo")]
          ),
          _vm._v(" /\n      Drawings by "),
          _c("span", { staticStyle: { color: "white" } }, [
            _vm._v("Giorgia Nizzoli")
          ])
        ])
      ])
    ])
  }
]
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/home.vue?vue&type=template&id=d8550b4a&":
/*!********************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/home.vue?vue&type=template&id=d8550b4a& ***!
  \********************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass:
        "phase-container text-center flex-column align-items-center justify-content-center row",
      staticStyle: { height: "100vh", margin: "0" }
    },
    [
      _vm._m(0),
      _vm._v(" "),
      _c(
        "div",
        [
          _c(
            "b-button",
            {
              staticClass: "btn-entry",
              attrs: { variant: "warning", size: "lg" },
              on: { click: _vm.onCreateMap }
            },
            [_vm._v("Create Map")]
          )
        ],
        1
      ),
      _vm._v(" "),
      _c(
        "div",
        [
          _c(
            "b-button",
            {
              staticClass: "btn-entry",
              attrs: { variant: "info", size: "lg" },
              on: { click: _vm.onEditMap }
            },
            [_vm._v("Edit Map")]
          )
        ],
        1
      ),
      _vm._v(" "),
      _c(
        "b-modal",
        {
          ref: "map-load-modal",
          attrs: { "hide-footer": "", title: "Gimme the map" }
        },
        [
          _c("b-form-file", {
            attrs: {
              state: Boolean(_vm.file),
              placeholder: "Choose a file or drop it here...",
              "drop-placeholder": "Drop file here...",
              accept: ".dndm"
            },
            model: {
              value: _vm.file,
              callback: function($$v) {
                _vm.file = $$v
              },
              expression: "file"
            }
          })
        ],
        1
      ),
      _vm._v(" "),
      _c("footer-component")
    ],
    1
  )
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "text-white" }, [
      _c(
        "p",
        {
          staticClass: "title",
          staticStyle: { "font-size": "3.5em", margin: "0" }
        },
        [_vm._v("DRAW&DICE")]
      ),
      _vm._v(" "),
      _c("p", { staticStyle: { "font-size": "2em" } }, [_vm._v("Dnd made ez!")])
    ])
  }
]
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/mapInput.vue?vue&type=template&id=7e9d406c&scoped=true&":
/*!************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/mapInput.vue?vue&type=template&id=7e9d406c&scoped=true& ***!
  \************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "b-modal",
    { ref: "my-modal", attrs: { "hide-footer": "", title: "Gimme the map" } },
    [
      _c("div", { staticClass: "d-block text-center" }, [
        _c("h3", [_vm._v("Insert map to load")])
      ]),
      _vm._v(" "),
      _c(
        "b-button",
        {
          staticClass: "mt-3",
          attrs: { variant: "outline-danger", block: "" },
          on: { click: _vm.hideModal }
        },
        [_vm._v("Cancel")]
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/loading/loading.vue?vue&type=template&id=b10af496&":
/*!**************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/loading/loading.vue?vue&type=template&id=b10af496& ***!
  \**************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c("div", { staticClass: "sloading-container" }, [
      _c("h1", { staticClass: "sloading-title" }, [_vm._v("DRAW&DICE")]),
      _vm._v(" "),
      _c("h2", [_vm._v(_vm._s(_vm.message))]),
      _vm._v(" "),
      _c("h5", [_vm._v("Loading")])
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/compWrapper.vue?vue&type=style&index=0&id=03d324d6&scoped=true&lang=css&":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/compWrapper.vue?vue&type=style&index=0&id=03d324d6&scoped=true&lang=css& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(/*! !!../../../../node_modules/css-loader/dist/cjs.js!../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./compWrapper.vue?vue&type=style&index=0&id=03d324d6&scoped=true&lang=css& */ "./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/compWrapper.vue?vue&type=style&index=0&id=03d324d6&scoped=true&lang=css&");
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(/*! !../../../../node_modules/vue-style-loader/lib/addStylesClient.js */ "./node_modules/vue-style-loader/lib/addStylesClient.js").default
var update = add("20adba36", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ "./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/entityInspect.vue?vue&type=style&index=0&id=c407dbfa&scoped=true&lang=css&":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/entityInspect.vue?vue&type=style&index=0&id=c407dbfa&scoped=true&lang=css& ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(/*! !!../../../../node_modules/css-loader/dist/cjs.js!../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./entityInspect.vue?vue&type=style&index=0&id=c407dbfa&scoped=true&lang=css& */ "./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/ecs/entityInspect.vue?vue&type=style&index=0&id=c407dbfa&scoped=true&lang=css&");
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(/*! !../../../../node_modules/vue-style-loader/lib/addStylesClient.js */ "./node_modules/vue-style-loader/lib/addStylesClient.js").default
var update = add("0e8a47b6", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ "./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/editMap.vue?vue&type=style&index=0&id=53b46051&scoped=true&lang=css&":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/editMap.vue?vue&type=style&index=0&id=53b46051&scoped=true&lang=css& ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(/*! !!../../../../node_modules/css-loader/dist/cjs.js!../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./editMap.vue?vue&type=style&index=0&id=53b46051&scoped=true&lang=css& */ "./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/edit/editMap.vue?vue&type=style&index=0&id=53b46051&scoped=true&lang=css&");
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(/*! !../../../../node_modules/vue-style-loader/lib/addStylesClient.js */ "./node_modules/vue-style-loader/lib/addStylesClient.js").default
var update = add("cf98b6ba", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ "./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/footer.vue?vue&type=style&index=0&id=539f2bff&scoped=true&lang=css&":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/footer.vue?vue&type=style&index=0&id=539f2bff&scoped=true&lang=css& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(/*! !!../../../node_modules/css-loader/dist/cjs.js!../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./footer.vue?vue&type=style&index=0&id=539f2bff&scoped=true&lang=css& */ "./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/footer.vue?vue&type=style&index=0&id=539f2bff&scoped=true&lang=css&");
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(/*! !../../../node_modules/vue-style-loader/lib/addStylesClient.js */ "./node_modules/vue-style-loader/lib/addStylesClient.js").default
var update = add("7c681468", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ "./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/home.vue?vue&type=style&index=0&lang=css&":
/*!**********************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/home.vue?vue&type=style&index=0&lang=css& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(/*! !!../../../../node_modules/css-loader/dist/cjs.js!../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./home.vue?vue&type=style&index=0&lang=css& */ "./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/home/home.vue?vue&type=style&index=0&lang=css&");
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(/*! !../../../../node_modules/vue-style-loader/lib/addStylesClient.js */ "./node_modules/vue-style-loader/lib/addStylesClient.js").default
var update = add("3421859f", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ "./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/loading/loading.vue?vue&type=style&index=0&lang=css&":
/*!****************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/loading/loading.vue?vue&type=style&index=0&lang=css& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(/*! !!../../../../node_modules/css-loader/dist/cjs.js!../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./loading.vue?vue&type=style&index=0&lang=css& */ "./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/app/ui/loading/loading.vue?vue&type=style&index=0&lang=css&");
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(/*! !../../../../node_modules/vue-style-loader/lib/addStylesClient.js */ "./node_modules/vue-style-loader/lib/addStylesClient.js").default
var update = add("13877244", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ "./src/public/style.css":
/*!******************************!*\
  !*** ./src/public/style.css ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/public/style.css");
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(/*! !../../node_modules/vue-style-loader/lib/addStylesClient.js */ "./node_modules/vue-style-loader/lib/addStylesClient.js").default
var update = add("511f390e", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ "./src/public/spritesheets/props.json":
/*!********************************************!*\
  !*** ./src/public/spritesheets/props.json ***!
  \********************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"frames":{"ladder_down.png":{"frame":{"x":0,"y":0,"w":64,"h":64},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":64,"h":64},"sourceSize":{"w":64,"h":64}},"ladder_up.png":{"frame":{"x":64,"y":0,"w":64,"h":64},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":64,"h":64},"sourceSize":{"w":64,"h":64}}},"meta":{"app":"https://www.codeandweb.com/texturepacker","version":"1.0","image":"props.png","format":"RGBA8888","size":{"w":128,"h":64},"scale":"1","smartupdate":"$TexturePacker:SmartUpdate:e4f96f20e593ddd42c4cf1d50d2d8f26:7e60e2d391e00eeed0a16270f3c0f13d:f4c39b94f5b79b4c461da96ae5609d50$"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	// It's empty as some runtime module handles the default behavior
/******/ 	__webpack_require__.x = x => {};
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// Promise = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		var deferredModules = [
/******/ 			["./src/app/index.ts","vendors-node_modules_fortawesome_fontawesome-free_js_all_js-node_modules_msgpack_msgpack_dist-1a4cc9"]
/******/ 		];
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		var checkDeferredModules = x => {};
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime, executeModules] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0, resolves = [];
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					resolves.push(installedChunks[chunkId][0]);
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			for(moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			while(resolves.length) {
/******/ 				resolves.shift()();
/******/ 			}
/******/ 		
/******/ 			// add entry modules from loaded chunk to deferred list
/******/ 			if(executeModules) deferredModules.push.apply(deferredModules, executeModules);
/******/ 		
/******/ 			// run deferred modules when all chunks ready
/******/ 			return checkDeferredModules();
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkdrawndice"] = self["webpackChunkdrawndice"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 		
/******/ 		function checkDeferredModulesImpl() {
/******/ 			var result;
/******/ 			for(var i = 0; i < deferredModules.length; i++) {
/******/ 				var deferredModule = deferredModules[i];
/******/ 				var fulfilled = true;
/******/ 				for(var j = 1; j < deferredModule.length; j++) {
/******/ 					var depId = deferredModule[j];
/******/ 					if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferredModules.splice(i--, 1);
/******/ 					result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 				}
/******/ 			}
/******/ 			if(deferredModules.length === 0) {
/******/ 				__webpack_require__.x();
/******/ 				__webpack_require__.x = x => {};
/******/ 			}
/******/ 			return result;
/******/ 		}
/******/ 		var startup = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			// reset startup function so it can be called again when more startup code is added
/******/ 			__webpack_require__.x = startup || (x => {});
/******/ 			return (checkDeferredModules = checkDeferredModulesImpl)();
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;