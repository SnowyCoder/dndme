<template>
  <div class="px-3 py-2">
    <div class="d-flex flex-row align-items-center">
      <div class="">Light:</div>
      <b-input type="color" v-model="ambientLight" :readonly="!world.isMaster"
               @change="onAmbientLightChange"></b-input>
    </div>
    <div class="d-flex flex-row align-items-center">
      <div class="">Needs light:</div>
      <b-form-checkbox v-model="needsLight" @input="onAmbientLightChange"
                       :readonly="!world.isMaster"></b-form-checkbox>
    </div>
    <div class="d-flex flex-row align-items-center">
      <div class="">Vision type:</div>
      <b-button :pressed.sync="roleplayVision" :readonly="!world.isMaster">
        {{ roleplayVision ? "Roleplayer" : "Master" }}
      </b-button>
    </div>
    <div class="d-flex flex-row align-items-center">
      <div class="">Background:</div>
      <b-input type="color" v-model="background" :readonly="!world.isMaster"
               @change="onAmbientLightChange"></b-input>
    </div>
    <div>
      <b-button @click="onLightSettingsReset">Reset</b-button>
    </div>
  </div>
</template>

<script lang="ts">

import {VComponent, VProp, Vue, VWatch} from "../vue";
import {Resource} from "../../ecs/resource";
import {World} from "../../ecs/world";
import {DEFAULT_LIGHT_SETTINGS, LightSettings, LocalLightSettings} from "../../ecs/systems/lightSystem";
import string2hex = PIXI.utils.string2hex;
import hex2string = PIXI.utils.hex2string;

@VComponent
export default class GridEdit extends Vue {
  @VProp({ required: true })
  world!: World;

  ambientLight = '#000000';
  needsLight = true;
  roleplayVision = false;
  background = '#000000';

  mounted() {
    this.world.events.on('resource_edited', this.onResourceEdited, this);
    this.reloadLight();
  }

  unmounted() {
    this.world.events.off('resource_edited', this.onResourceEdited, this);
  }

  onResourceEdited(res: Resource) {
    if (res.type === 'light_settings' || res.type === 'local_light_settings') {
      this.reloadLight();
    }
  }

  reloadLight() {
    let light = this.world.getResource('light_settings') as LightSettings;
    this.ambientLight = hex2string(light.ambientLight);
    this.needsLight = light.needsLight;
    this.background = hex2string(light.background);
    let llight = this.world.getResource('local_light_settings') as LocalLightSettings;
    this.roleplayVision = llight.visionType === 'rp';
  }

  onAmbientLightChange() {
    this.world.addResource({
      type: 'light_settings',
      ambientLight: string2hex(this.ambientLight),
      needsLight: this.needsLight,
      background: string2hex(this.background),
    } as LightSettings, 'update');
  }

  onLightSettingsReset() {
    this.world.addResource(Object.assign({
      type: 'light_settings',
    }, DEFAULT_LIGHT_SETTINGS) as LightSettings, 'update');
    this.reloadLight();
  }

  @VWatch('roleplayVision')
  onRPVisChange() {
    let visionType = this.roleplayVision ? 'rp' : 'dm';

    this.world.editResource('local_light_settings', {visionType});
  }
}
</script>