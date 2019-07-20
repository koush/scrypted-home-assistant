import { callService, Connection, HassEntity } from "home-assistant-js-websocket";
import { Brightness, ColorSettingHsv, ColorSettingTemperature, ScryptedInterface } from "../../scrypted-deploy";
import { HassBase } from "./base";
import { bitmaskToInterfaces, makeKeys } from "./util";


const Features = makeKeys({
    SUPPORT_BRIGHTNESS: 1,
    SUPPORT_COLOR_TEMP: 2,
    SUPPORT_EFFECT: 4,
    SUPPORT_FLASH: 8,
    SUPPORT_COLOR: 16,
    SUPPORT_TRANSITION: 32,
    SUPPORT_WHITE_VALUE: 128,
});

const FeatureMap = {
    SUPPORT_BRIGHTNESS: ScryptedInterface.Brightness,
    SUPPORT_COLOR_TEMP: ScryptedInterface.ColorSettingTemperature,
    SUPPORT_COLOR: ScryptedInterface.ColorSettingHsv,
}

class HassLight extends HassBase implements Brightness, ColorSettingHsv, ColorSettingTemperature {
    constructor(connection: Connection, entity: HassEntity) {
        super(connection, entity);
    }
    turnOff(): void {
        callService(this.connection, "homeassistant", "turn_off", {
            entity_id: this.nativeId
        });
    }
    turnOn(): void {
        callService(this.connection, "homeassistant", "turn_on", {
            entity_id: this.nativeId
        });
    }
    setBrightness(brightness: number): void {
        callService(this.connection, "homeassistant", "turn_on", {
            entity_id: this.nativeId,
            brightness: Math.round(brightness * 255 / 100),
        });
    }
    getInterfaces(): string[] {
        var ret = bitmaskToInterfaces(this.entity.attributes.supported_features, Features, FeatureMap);
        ret.push(ScryptedInterface.OnOff);
        return ret;
    }
    setHsv(hue: number, saturation: number, value: number): void {
        callService(this.connection, "homeassistant", "turn_on", {
            entity_id: this.nativeId,
            hs_color: [hue, saturation * 100],
        });
    }
    getTemperatureMaxK(): number {
        return 6500;
    }
    getTemperatureMinK(): number {
        return 2500;
    }
    setColorTemperature(kelvin: number): void {
        // mired conversion
        var color_temp = Math.round(1000000 / kelvin);
        callService(this.connection, "homeassistant", "turn_on", {
            entity_id: this.nativeId,
            color_temp,
        });
    }
    updateState(entity: HassEntity) {
        this.on = entity.state === 'on';
        this.setState(entity, 'brightness', brightness => this.brightness = brightness * 100 / 255);
        this.setState(entity, 'hs_color', ([h, s]) => this.hsv = { h, s: s / 100, v: 1 });
        this.setState(entity, 'color_temp', color_temp => this.colorTemperature = Math.round(1000000 / color_temp));
    }
}

export default HassLight;