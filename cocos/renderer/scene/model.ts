// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
import { aabb } from '../../3d/geom-utils';
import { GFXInputAttribute } from '../../gfx/input-assembler';
import { GFXFormat, GFXBufferUsageBit, GFXMemoryUsageBit } from '../../gfx/define';
import { RenderScene } from './render-scene';
import { vec3 } from '../../core/vmath';
import { Vec3 } from '../../core/value-types';
import { Node } from '../../scene-graph';
import InputAssembler from '../core/input-assembler';
import Effect from '../core/effect';
import { Pass } from '../core/pass';
import { GFXCommandBuffer } from '../../gfx/command-buffer';

/**
 * A representation of a model
 */
export default class Model {

    _scene: RenderScene | null;
    _id: number;
    _enable: boolean;
    _type: string;
    _poolID: number;
    _isEnable: boolean;
    _node: Node;
    _inputAssembler: InputAssembler;
    _effect: Effect | null;
    _defines: Object;
    _dependencies: Object;
    _viewID: number;
    _cameraID: number;
    _userKey: number;
    _castShadow: boolean;
    _boundingShape: aabb;
    _bsModelSpace: aabb;
    _passes: Pass[];
    _cmdBuffers: GFXCommandBuffer[];
    /**
     * Setup a default empty model
     */
    constructor() {
        this._scene = null;
        this._id = 0;
        this._enable = false;

        this._type = 'default';
        this._poolID = -1;
        this._isEnable = true;
        this._node = null;
        this._inputAssembler = null;
        this._effect = null;
        this._defines = {};
        this._dependencies = {};
        this._viewID = -1;
        this._cameraID = -1;
        this._userKey = -1;
        this._castShadow = false;
        this._boundingShape = null;
        this._passes = new Array<Pass>();
        this._cmdBuffers = new Array<GFXCommandBuffer>();
    }

    setScene(scene: RenderScene) {
        this._scene = scene;

        if (this._scene) {
            this._id = this._scene.generateModelId();
        }
    }

    get scene(): RenderScene | null {
        return this._scene;
    }

    get id(): number {
        return this._id;
    }

    _updateTransform() {
        if (!this._node._hasChanged || !this._boundingShape) return;
        this._node.updateWorldTransformFull();
        this._bsModelSpace.transform(this._node._mat, this._node._pos,
            this._node._rot, this._node._scale, this._boundingShape);
    }

    /**
     * Create the bounding shape of this model
     * @param {vec3} minPos the min position of the model
     * @param {vec3} maxPos the max position of the model
     */
    createBoundingShape(minPos: Vec3, maxPos: Vec3) {
        if (!minPos || !maxPos) return;
        this._bsModelSpace = aabb.fromPoints(aabb.create(), minPos, maxPos);
        this._boundingShape = aabb.clone(this._bsModelSpace);
    }

    enable(isEnable: boolean) {
        this._isEnable = isEnable;
    }

    isEnable(): boolean {
        return this._isEnable;
    }

    /**
     * Get the hosting node of this camera
     * @returns {Node} the hosting node
     */
    getNode(): Node {
        return this._node;
    }

    /**
     * Set the hosting node of this model
     * @param {Node} node the hosting node
     */
    setNode(node: Node) {
        this._node = node;
    }

    /**
     * Set the input assembler
     * @param {InputAssembler} ia
     */
    setInputAssembler(ia: InputAssembler) {
        this._inputAssembler = ia;
    }

    /**
     * Set the model effect
     * @param {?Effect} effect the effect to use
     */
    setEffect(effect: Effect) {
        if (effect) {
            this._effect = effect;
            this._defines = effect.extractDefines(Object.create(null));
            this._dependencies = effect.extractDependencies(Object.create(null));
        } else {
            this._effect = null;
            this._defines = Object.create(null);
            this._dependencies = Object.create(null);
        }
    }

    /**
     * Set the user key
     * @param {number} key
     */
    setUserKey(key: number) {
        this._userKey = key;
    }

    getPassList(): Pass[] {
        return this._passes;
    }

    getCmdBufferList(): GFXCommandBuffer[] {
        return this._cmdBuffers;
    }

    /**
     * Extract a drawing item
     * @param {Object} out the receiving item
     */
    extractDrawItem(out) {
        out.model = this;
        out.node = this._node;
        out.ia = this._inputAssembler;
        out.effect = this._effect;
        out.defines = this._effect ? this._effect.extractDefines(this._defines) : this._defines;
        out.dependencies = this._effect ? this._effect.extractDependencies(this._dependencies) : this._dependencies;
    }
}
