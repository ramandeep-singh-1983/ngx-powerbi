import { Injectable, Optional } from '@angular/core';
import {
  Embed,
  factories,
  IEmbedConfiguration,
  Report,
  service as pbiService,
  Tile
} from 'powerbi-client';

export function powerBiServiceFactory() {
  return new pbiService.Service(
    factories.hpmFactory,
    factories.wpmpFactory,
    factories.routerFactory
  );
}

@Injectable({
  providedIn: 'root',
  useFactory: powerBiServiceFactory
})
export class NgxPowerBiService {
  private powerBiCoreService: pbiService.Service;

  constructor(@Optional() private service?: pbiService.Service) {
    if (!service) {
      this.powerBiCoreService = new pbiService.Service(
        factories.hpmFactory,
        factories.wpmpFactory,
        factories.routerFactory
      );
    } else {
      this.powerBiCoreService = service;
    }
  }

  /**
   * Creates new report
   * @param HTMLElement Parent HTML element
   * @param IEmbedConfiguration Embed configuration
   * @returns Embed Embedded object
   */
  createReport(element: HTMLElement, config: IEmbedConfiguration): Embed {
    return this.powerBiCoreService.createReport(element, config);
  }

  /**
   * Given a configuration based on an HTML element,
   * if the component has already been created and attached to the element, reuses the component instance and existing iframe,
   * otherwise creates a new component instance.
   *
   * @param HTMLElement Parent HTML element
   * @param IEmbedConfiguration Embed configuration
   * @returns Embed Embedded object
   */
  embed(element: HTMLElement, config: IEmbedConfiguration): Embed {
    return this.powerBiCoreService.embed(element, config);
  }

  /**
   * Given a configuration based on an HTML element,
   * if the component has already been created and attached to the element, reuses the component instance and existing iframe,
   * otherwise creates a new component instance.
   * This is used for the phased embedding API, once element is loaded successfully, one can call 'render' on it.
   *
   * @param HTMLElement} Parent HTML element
   * @param IEmbedConfiguration Embed configuration
   * @returns Embed Embedded object
   */
  load(element: HTMLElement, config: IEmbedConfiguration): Embed {
    return this.powerBiCoreService.load(element, config);
  }

  /**
   * Adds an event handler for DOMContentLoaded, which searches the DOM for elements that have the 'powerbi-embed-url' attribute,
   * and automatically attempts to embed a Power BI component based on information from other powerbi-* attributes.
   *
   * Note: Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
   * This handler is typically useful only for applications that are rendered on the server so that all
   * required data is available when the handler is called.
   */
  enableAutoEmbed(): void {
    return this.powerBiCoreService.enableAutoEmbed();
  }

  /**
   * Returns an instance of the component associated with the element.
   *
   * @param HTMLElement Parent HTML element
   * @returns (Report | Tile) Embedded report/tile object
   */
  get(element: HTMLElement): Embed {
    return this.powerBiCoreService.get(element);
  }

  /**
   * Finds an embed instance by the name or unique ID that is provided.
   *
   * @param string} uniqueId or name of the report/tile
   * @returns (Report | Tile) Embedded report/tile object
   */
  findById(uniqueId: string): Report | Tile {
    return this.powerBiCoreService.find(uniqueId);
  }

  /**
   * Given an HTML element that has a component embedded within it,
   * removes the component from the list of embedded components,
   * removes the association between the element and the component, and removes the iframe.
   *
   * @param HTMLElement Parent HTML element
   * @returns void
   */
  reset(element: HTMLElement): void {
    return this.powerBiCoreService.reset(element);
  }

  /**
   * handles tile events
   *
   * @param IEvent<any> event
   */
  handleTileEvents(event: pbiService.IEvent<any>): void {
    return this.powerBiCoreService.handleTileEvents(event);
  }

  /**
   * API for warm starting Power BI embedded endpoints.
   * Use this API to preload Power BI Embedded in the background.
   *
   * @param embed.IEmbedConfiguration Embed configuration
   * @param HTMLElement [element=undefined]
   */
  preload(
    config: IEmbedConfiguration,
    element: HTMLElement
  ): HTMLIFrameElement {
    return this.powerBiCoreService.preload(config, element);
  }
}
