import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as pbi from 'powerbi-client';
import * as models from 'powerbi-models';

import { NgxPowerBiService } from './ngx-powerbi.service';

export const enum TokenType {
  Aad = 'Aad',
  Embed = 'Embed'
}

export const enum ReportType {
  Dashboard = 'Dashboard',
  Report = 'Report',
  Tile = 'Tile'
}

@Component({
  selector: 'ngx-powerbi-component',
  template: '<div #ngxPowerBiIFrame style="height:100%; width: 100%;"></div>',
  styles: []
})
export class NgxPowerBiComponent implements AfterViewInit, OnChanges, OnDestroy {
  // Public properties
  @Input() accessToken: string;
  @Input() tokenType: TokenType;
  @Input() embedUrl: string;
  @Input() id: string;
  @Input() type: ReportType;
  @Input() name: string;
  @Input() options: models.ISettings;
  @Output() embedded = new EventEmitter<number>();
  @ViewChild('ngxPowerBiIFrame', {static: true}) ngxPowerBiIFrameRef: ElementRef;

  // Private fields
  private component: pbi.Embed;
  private powerBiService: NgxPowerBiService;

  constructor(private ngxPowerBiService: NgxPowerBiService) {
    this.powerBiService = ngxPowerBiService;
  }

  ngAfterViewInit() {
    // Embed the report inside the view child that we have fetched from the DOM
    if (
      this.ngxPowerBiIFrameRef.nativeElement &&
      this.validateRequiredAttributes()
    ) {
      this.embed(this.ngxPowerBiIFrameRef.nativeElement, this.getConfig());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.ngxPowerBiIFrameRef) {
      return;
    }
    const {
      accessToken,
      tokenType,
      embedUrl,
      id,
      type,
      name,
      options
    } = changes;

    // TODO: Validate these conditions
    /*if (
      (accessToken.previousValue !== undefined || accessToken.previousValue === accessToken.currentValue) &&
      embedUrl.previousValue === embedUrl.currentValue
    ) {
      return;
    }*/

    if (this.validateRequiredAttributes()) {
      const config = this.getConfig(
        accessToken && accessToken.currentValue,
        tokenType && tokenType.currentValue,
        embedUrl && embedUrl.currentValue,
        id && id.currentValue,
        type && type.currentValue,
        name && name.currentValue,
        options && options.currentValue
      );
      this.embed(this.ngxPowerBiIFrameRef.nativeElement, config);
    } else if (this.component) {
      this.reset(this.ngxPowerBiIFrameRef.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.component) {
      this.reset(this.ngxPowerBiIFrameRef.nativeElement);
    }
  }

  /**
   * Ensure required attributes (embedUrl and accessToken are valid before attempting to embed)
   */
  private validateRequiredAttributes(): boolean {
    return (
      typeof this.embedUrl === 'string' &&
      this.embedUrl.length > 0 &&
      (typeof this.accessToken === 'string' && this.accessToken.length > 0)
    );
  }

  /**
   * Get the model class compatible token enum from our token type enum
   * @param tokenType - Token type in our custom enum format
   * @returns Token type in powerbi-models.TokenType enum format
   */
  private getTokenType(tokenType: TokenType): models.TokenType {
    if (tokenType) {
      switch (tokenType) {
        case TokenType.Aad:
          return models.TokenType.Aad;
        case TokenType.Embed:
          return models.TokenType.Embed;
        default:
          return models.TokenType.Aad;
      }
    } else {
      // default is AAD
      return models.TokenType.Aad;
    }
  }

  /**
   * Returns an embed configuration object.
   * @param accessToken - Access token required to embed a component
   * @param tokenType - type of accessToken: Aad or Embed
   * @param embedUrl - Embed URL obtained through Power BI REST API or Portal
   * @param id - component/element GUID
   * @param type - type of embedded component e.g. 'dashboard, report or tile'
   * @param name - name of the embedded component
   * @param options - Embed configuration options
   * @returns Embed configuration object
   */
  private getConfig(
    accessToken?: string,
    tokenType?: TokenType,
    embedUrl?: string,
    id?: string,
    type?: ReportType,
    name?: string,
    options?: models.ISettings
  ): pbi.IEmbedConfiguration {
    // For null arguments - use the initial value
    // For specified arguments - use the current value
    return {
      type: type ? type : this.type ? this.type : ReportType.Report,
      embedUrl: embedUrl ? embedUrl : this.embedUrl,
      accessToken: accessToken ? accessToken : this.accessToken,
      tokenType: tokenType
        ? this.getTokenType(tokenType)
        : this.getTokenType(this.tokenType),
      id: id ? id : this.id,
      uniqueId: name ? name : this.name,
      settings: options ? options : this.options
    };
  }

  /**
   * Given an HTMLElement, construct an embed configuration based on attributes and pass to service.
   * @param element - native element where the embedding needs to be done
   * @param config - configuration to be embedded
   */
  private embed(element: HTMLElement, config: pbi.IEmbedConfiguration) {
    /*if (this.options) {
      const newConfig = { config, ...this.options };
    }*/

    this.component = this.powerBiService.embed(element, config);
    this.embedded.emit(this.component as any);
  }

  /**
   * Reset the component that has been removed from DOM.
   * @param element - native element where the embedded was made
   */
  reset(element: HTMLElement) {
    this.powerBiService.reset(element);
    this.component = null;
  }
}
