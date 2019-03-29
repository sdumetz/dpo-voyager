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

import CVAssetReader from "../../components/CVAssetReader";
import CVSetup from "../../components/CVSetup";
import CVReader, { EReaderPosition } from "../../components/CVReader";

import SceneView from "../SceneView";
import "../Spinner";
import "./ReaderView";

import DocumentView, { customElement, html } from "./DocumentView";

////////////////////////////////////////////////////////////////////////////////

@customElement("sv-content-view")
export default class ContentView extends DocumentView
{
    protected sceneView: SceneView = null;

    protected get assetLoader() {
        return this.system.getMainComponent(CVAssetReader);
    }

    protected firstConnected()
    {
        this.classList.add("sv-content-view");
        this.sceneView = new SceneView(this.system);
    }

    protected connected()
    {
        super.connected();
        this.assetLoader.outs.busy.on("value", this.performUpdate, this);
    }

    protected disconnected()
    {
        this.assetLoader.outs.busy.off("value", this.performUpdate, this);
        super.disconnected();
    }

    protected render()
    {
        const system = this.system;
        const isLoading = this.assetLoader.outs.busy.value;

        let readerVisible = false;
        let readerPosition = EReaderPosition.Overlay;

        const scene = this.activeScene;
        if (scene) {
            readerVisible = scene.reader.ins.visible.value;
            readerPosition = scene.reader.ins.position.value;
        }

        const sceneView = this.sceneView;
        sceneView.classList.remove("sv-blur");

        // TODO: quick hack
        //if (!isLoading) {
        //    const scene = this.system.getComponent(CVScene, true);
        //    if (scene) {
        //        scene.ins.zoomExtents.set();
        //    }
        //}

        if (readerVisible) {
            if (readerPosition === EReaderPosition.Right) {

                return html`<div class="sv-content-reader-split">${sceneView}
                    <ff-splitter direction="horizontal"></ff-splitter>
                    <sv-reader-view .system=${system} class="sv-reader-split"></sv-reader-view></div>
                    <sv-spinner ?visible=${isLoading}></sv-spinner>`;

            }
            if (readerPosition === EReaderPosition.Overlay) {

                setTimeout(() => sceneView.classList.add("sv-blur"), 1);

                return html`<div class="sv-content-reader-overlay">${sceneView}
                    <sv-reader-view .system=${system}></sv-reader-view>
                    <sv-spinner ?visible=${isLoading}></sv-spinner></div>`;
            }
        }

        return html`<div class="sv-content-reader-off">${sceneView}</div>
            <sv-spinner ?visible=${isLoading}></sv-spinner>`;
    }

    protected onActiveFeatures(previous: CVSetup, next: CVSetup)
    {
        if (previous) {
            const reader = previous.reader;
            reader.ins.visible.off("value", this.onUpdate, this);
            reader.ins.position.off("value", this.onUpdate, this);
        }
        if (next) {
            const reader = next.reader;
            reader.ins.visible.on("value", this.onUpdate, this);
            reader.ins.position.on("value", this.onUpdate, this);
        }

        this.requestUpdate();
    }
}

