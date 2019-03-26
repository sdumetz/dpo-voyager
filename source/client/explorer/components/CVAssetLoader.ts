/**
 * 3D Foundation Project
 * Copyright 2018 Smithsonian Institution
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import resolvePathname from "resolve-pathname";
import * as THREE from "three";

import Component, { types } from "@ff/graph/Component";

import { IDocument } from "common/types/document";

import JSONLoader from "../../core/loaders/JSONLoader";
import JSONValidator from "../../core/loaders/JSONValidator";
import ModelLoader from "../../core/loaders/ModelLoader";
import GeometryLoader from "../../core/loaders/GeometryLoader";
import TextureLoader from "../../core/loaders/TextureLoader";

import Asset from "../../core/models/Asset";

////////////////////////////////////////////////////////////////////////////////

const _VERBOSE = true;


export default class CVAssetLoader extends Component
{
    static readonly typeName: string = "CVAssetLoader";

    protected static readonly ins = {
        rootUrl: types.String("Loader.RootURL"),
    };

    protected static readonly outs = {
        loading: types.Boolean("Loader.IsLoading"),
    };

    ins = this.addInputs(CVAssetLoader.ins);
    outs = this.addOutputs(CVAssetLoader.outs);

    readonly jsonLoader: JSONLoader;
    readonly validator: JSONValidator;
    readonly modelLoader: ModelLoader;
    readonly geometryLoader: GeometryLoader;
    readonly textureLoader: TextureLoader;

    private _loadingManager: PrivateLoadingManager;


    constructor(id: string)
    {
        super(id);

        const loadingManager = this._loadingManager = new PrivateLoadingManager(this);

        this.jsonLoader = new JSONLoader(loadingManager);
        this.validator = new JSONValidator();
        this.modelLoader = new ModelLoader(loadingManager);
        this.geometryLoader = new GeometryLoader(loadingManager);
        this.textureLoader = new TextureLoader(loadingManager);
    }

    setRootURL(url: string)
    {
        const href = window.location.href.split("?")[0];
        let rootUrl = resolvePathname(url, href);
        rootUrl = resolvePathname(".", rootUrl);
        this.ins.rootUrl.setValue(rootUrl);
        console.log("ROOT URL: %s", rootUrl);
    }

    getAssetURL(uri: string)
    {
        console.log(uri, this.ins.rootUrl.value);
        console.log(resolvePathname(uri, this.ins.rootUrl.value));

        return resolvePathname(uri, this.ins.rootUrl.value);
    }

    loadJSON(url: string): Promise<any>
    {
        url = this.getAssetURL(url);
        return this.jsonLoader.load(url);
    }

    loadModelAsset(asset: Asset): Promise<THREE.Object3D>
    {
        const url = this.getAssetURL(asset.data.uri);
        return this.modelLoader.load(url);
    }

    loadGeometryAsset(asset: Asset): Promise<THREE.Geometry>
    {
        const url = this.getAssetURL(asset.data.uri);
        return this.geometryLoader.load(url);
    }

    loadTextureAsset(asset: Asset): Promise<THREE.Texture>
    {
        const url = this.getAssetURL(asset.data.uri);
        return this.textureLoader.load(url);
    }

    loadDocumentData(url: string): Promise<IDocument>
    {
        return this.loadJSON(url).then(json => this.validateDocument(json));
    }

    validateDocument(json: any): Promise<IDocument>
    {
        return new Promise((resolve, reject) => {
            if (!this.validator.validateDocument(json)) {
                return reject(new Error("invalid document data, validation failed"));
            }

            return resolve(json as IDocument);
        });
    }
}

////////////////////////////////////////////////////////////////////////////////

class PrivateLoadingManager extends THREE.LoadingManager
{
    protected assetLoader: CVAssetLoader;

    constructor(assetLoader: CVAssetLoader)
    {
        super();
        this.assetLoader = assetLoader;

        this.onStart = this.onLoadingStart.bind(this);
        this.onProgress = this.onLoadingProgress.bind(this);
        this.onLoad = this.onLoadingCompleted.bind(this);
        this.onError = this.onLoadingError.bind(this);
    }

    protected onLoadingStart()
    {
        if (_VERBOSE) {
            console.log("Loading files...");
        }

        this.assetLoader.outs.loading.setValue(true);
    }

    protected onLoadingProgress(url, itemsLoaded, itemsTotal)
    {
        if (_VERBOSE) {
            console.log(`Loaded ${itemsLoaded} of ${itemsTotal} files: ${url}`);
        }
    }

    protected onLoadingCompleted()
    {
        if (_VERBOSE) {
            console.log("Loading completed");
        }

        this.assetLoader.outs.loading.setValue(false);
    }

    protected onLoadingError()
    {
        if (_VERBOSE) {
            console.error(`Loading error`);
        }

        this.assetLoader.outs.loading.setValue(false);
    }
}