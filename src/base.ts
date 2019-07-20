import { ScryptedDeviceBase } from "../../scrypted-deploy";

import { Connection, HassEntity } from "home-assistant-js-websocket";

export abstract class HassBase extends ScryptedDeviceBase {
    connection: Connection;
    entity: HassEntity;

    constructor(connection: Connection, entity: HassEntity) {
        super(entity.entity_id);
        this.connection = connection;
        this.entity = entity;
    }

    abstract getInterfaces(): string[];
    abstract updateState(entity: HassEntity);
    setState(entity: HassEntity, property: string, cb: (value: any) => void) {
        if (entity.attributes[property] !== undefined) {
            cb(entity.attributes[property]);
        }
    }
}
