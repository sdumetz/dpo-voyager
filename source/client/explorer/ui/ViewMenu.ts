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

import { PropertyTracker } from "@ff/graph";
import RenderSystem from "@ff/scene/RenderSystem";

import "@ff/ui/Layout";
import "@ff/ui/IndexButton";
import "@ff/ui/Button";
import { IButtonClickEvent } from "@ff/ui/Button";

import { EProjection, EViewPreset } from "@ff/three/UniversalCamera";

import { customElement, html, property } from "@ff/ui/CustomElement";
import Popup from "@ff/ui/Popup";

////////////////////////////////////////////////////////////////////////////////

@customElement("sv-view-menu")
export default class ViewMenu extends Popup
{
    @property({ attribute: false })
    system: RenderSystem;

    protected viewPreset: EViewPreset;
    protected propProjection: PropertyTracker<EProjection>;
    protected propView: PropertyTracker<EViewPreset>;

    constructor(system?: RenderSystem)
    {
        super();

        this.system = system;
        this.viewPreset = EViewPreset.None;
        this.propProjection = new PropertyTracker(this.onPropertyChange, this);
        this.propView = new PropertyTracker(this.onPropertyChange, this);

        this.position = "anchor";
        this.align = "center";
        this.justify = "end";
        this.offsetX = 8;
        this.offsetY = 8;
        this.keepVisible = true;
    }

    protected connected()
    {
        super.connected();

        //this.propProjection.attachInput(this.system, Component, "path");
        //this.propView.attachInput(this.system, Component, "path");

    }

    protected disconnected()
    {
        super.disconnected();

        this.propProjection.detach();
        this.propView.detach();
    }

    protected render()
    {
        const projectionType = this.propProjection.getValue();
        const viewPreset = this.propView.getValue();

        return html`
            <label>Projection</label>
            <ff-flex-row @click=${this.onClickProjectionType}>
                <ff-index-button .index=${EProjection.Perspective} .selectedIndex=${projectionType}
                  text="Perspective" title="Perspective Projection" icon="fas fa-video"></ff-index-button>    
                <ff-index-button .index=${EProjection.Orthographic} .selectedIndex=${projectionType}
                  text="Orthographic" title="Orthographic Projection" icon="fas fa-video"></ff-index-button>    
            </ff-flex-row>
            <label>View</label>
            <ff-grid class="sv-cube" justifyContent="center" @click=${this.onClickViewPreset}>
                <ff-index-button .index=${EViewPreset.Top} .selectedIndex=${viewPreset}
                  text="T" title="Top View" style="grid-column-start: 2; grid-row-start: 1;"></ff-index-button>
                <ff-index-button .index=${EViewPreset.Left} .selectedIndex=${viewPreset}
                  text="L" title="Left View" style="grid-column-start: 1; grid-row-start: 2;"></ff-index-button>
                <ff-index-button .index=${EViewPreset.Front} .selectedIndex=${viewPreset}
                  text="F" title="Front View" style="grid-column-start: 2; grid-row-start: 2;"></ff-index-button>
                <ff-index-button .index=${EViewPreset.Right} .selectedIndex=${viewPreset}
                  text="R" title="Right View" style="grid-column-start: 3; grid-row-start: 2;"></ff-index-button>
                <ff-index-button .index=${EViewPreset.Back} .selectedIndex=${viewPreset}
                  text="B" title="Back View" style="grid-column-start: 4; grid-row-start: 2;"></ff-index-button>
                <ff-index-button .index=${EViewPreset.Bottom} .selectedIndex=${viewPreset}
                  text="B" title="Bottom View" style="grid-column-start: 2; grid-row-start: 3;"></ff-index-button>
            </ff-grid>
        `;
    }

    protected firstUpdated()
    {
        super.firstUpdated();

        this.setStyle({
            display: "flex",
            flexDirection: "column"
        });

        this.classList.add("sv-popup-menu");
    }

    protected onClickProjectionType(event: IButtonClickEvent)
    {
        this.propProjection.setValue(event.target.index);
        event.stopPropagation();
    }

    protected onClickViewPreset(event: IButtonClickEvent)
    {
        this.propView.setValue(event.target.index);
        event.stopPropagation();
    }

    protected onPropertyChange()
    {
        this.requestUpdate();
    }
}