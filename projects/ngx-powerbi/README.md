# ngx-powerbi

[![NPM Version](https://img.shields.io/npm/v/ngx-powerbi.svg)](https://www.npmjs.com/package/ngx-powerbi)
[![NPM Total Downloads](https://img.shields.io/npm/dt/ngx-powerbi.svg)](https://www.npmjs.com/package/ngx-powerbi)

TypeScript library for embedding Power BI assets (reports/dashboards/tiles) in your application. This TypeScript library is built on top of the official [powerbi-client](https://www.npmjs.com/package/powerbi-client) library provided by Microsoft.

## Installation

This library has a peer dependency on the official Microsoft [powerbi-client](https://www.npmjs.com/package/powerbi-client) library so the same should be installed first:
NPM:

```
npm install powerbi-client
```

Install the ngx-powerbi library:

```
npm install ngx-powerbi
```

## Usage

There are multiple ways to embed the Power BI assets in your application. The Power BI library needs an access token with required privileges for accessing the Power BI assets. You must have a Power BI Pro license or a trial account to access the Power BI embedded functionality. For details about Power BI account requirements and embedding, refer my [Power BI Overview and Angular Embedding How-to](https://medium.com/@ramandeep.singh.1983/power-bi-overview-and-angular-embedding-how-to-f73390f4a399) article.

Here are some of the sample ways of embedding a Power BI report in your application:

**Method 1**

Pick up and play: Use the included Power BI component directly in your component HTML file.

- **Import the 'NgxPowerBiModule' module inside your target module:**

```
import { NgxPowerBiModule } from 'ngx-powerbi';

@NgModule({
  imports: [
    ...
    ...
    NgxPowerBiModule
  ],
  exports: ...,
  declarations: ...
})
```

Use the provided component attribute to embed a Power BI asset:

```
<ngx-powerbi-component type="report"
                       id="[put-report-id-here]"
                       embedUrl="https://app.powerbi.com/reportEmbed?reportId=[put-report-id-here]&groupId=[put-group-id-here]"
                       tokenType="Aad"
                       accessToken="[put-access-token-here]"
                       on-embedded="onEmbedded($event)">
</ngx-powerbi-component>
```

Optional: Implement the `onEmbedded(report: pbi.Report)` in your component class if you want to capture Power BI embedded component events.

**Method 2**

Use the Power BI configuration HTML attributes in a div + Power BI embedded service. The component.html should look like this:

```
<div id="dashboard-container"
     powerbi-dashboard-id="[put-dashboard-id-here]"
     powerbi-access-token="[put-access-token-here]"
     powerbi-embed-url="https://app.powerbi.com/dashboardEmbed?dashboardId=[put-dashboard-id-here]&groupId=[put-group-id-here]"
     powerbi-type="dashboard"
     powerbi-settings-filter-pane-enabled="false"
     powerbi-settings-nav-content-pane-enabled="true">
</div>
```

In the component.ts file, use the provided embed API to embed the Power BI asset in this div component. Refer 'Method 3' for details about the usage of Power BI service and embed API. Since, we are specifying the configuration through HTML attributes here, the config object required by the embed API in the TypeScript code can be empty.

**Method 3**

If you want more fine-grain control of the embedding functionality, use the provided Power BI embedded service as per the instructions below:

- **Component HTML file: Add a new div with an ID, we will use the ID to get a reference to this div and embed the Power BI component:**

```
<div id="pbi-container"></div>
```

- **Import and instantiate the Power BI service in your component.ts file. Also, get a reference to the div we created in the component HTML file earlier:**

```
import { NgxPowerBiService } from 'ngx-powerbi';

export class ReportsContainer implements OnInit {
  private powerBiService: NgxPowerBiService;
  private pbiContainerElement: HTMLElement;

  constructor() {
    this.powerBiService = new NgxPowerBiService();
    ...
  }

  ngOnInit() {
    this.pbiContainerElement = <HTMLElement>(document.getElementById('pbi-container'));
  ...
  ...
}
```

Also, import any Power BI components that you need in your component.ts file:

```
import { Page } from 'page';
import { Report } from 'report';
import { Dashboard } from 'dashboard';
```

For example, if you want to embed a report, import the Report component and so on.

- **Now, you can call the Power BI service embed API inside your container to embed the content:**

```
this.powerBiService.embed(this.pbiContainerElement, config);
```

This API call will embed the Power BI component in the div element we created earlier. Notice the 'config' object we have provided as a 2nd argument in the embed() API call above. Refer the **'Embed Configuration'** section for details about this.

- **Handle the events for the embedded components:**
  Once a Power BI asset (dashboard/report/tile) is embedded in your application, you would want to listen to events so you can take appropriate actions whenever an event occurs. The powerBiService.embed(...) function returns an appropriate embedded object (dashboard/report/tile) and the event handlers can be set on this object. For example, if you are embedding a report, you can use the following event handler code:

```
report.on('loaded', function(event) {
  report.getPages().then(function(pages) {
    console.log('report loaded, number of pages: ', pages.length);
    // We only want to handle the 'loaded' event once
    report.off('loaded');
  });
});

report.off('pageChanged');
report.on<{ newPage: Page }>('pageChanged', event => {
  console.log('Page changed:', event.detail.newPage.displayName);
});
```

For more details about event handling, refer the Microsoft wiki page: https://github.com/Microsoft/PowerBI-JavaScript/wiki/Handling-Events

## Embed Configuration

The Power BI library provides a default embed configuration but you can define your own configuration too. For Method 2 above, the embed configuration has been provided through the HTML attributes itself, so the config object in our TypeScript code can be empty. For Method 3, we need to specify the embed configuration in the component.ts TypeScript code.

Sample configuration for dashboard:

```
const config = {
  type: 'dashboard',
  dashboardId: '[put-dashboard-id-here]',
  embedUrl:
    'https://app.powerbi.com/dashboardEmbed?' +
    'dashboardId=[put-dashboard-id-here]' +
    '&groupId=[put-group-id-here]',
  accessToken: [put-access-token-here]
};
```

Sample configuration for report:

```
const config = {
  type: 'report',
  id: '[put-report-id-here]',
  embedUrl:
    'https://app.powerbi.com/reportEmbed?' +
    'reportId=[put-report-id-here]' +
    '&groupId=[put-group-id-here]',
  accessToken: [put-access-token-here],
  settings: {
    filterPaneEnabled: this.filterPaneEnabled,
    navContentPaneEnabled: this.navContentPaneEnabled
  }
};
```

This config object can then be passed to `this.powerBiService.embed(this.pbiContainerElement, config)`.

For more details about embed configuration, refer the Microsoft wiki page: https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details

## Power BI access token

The Power BI embedding functionality requires an access token to the Power BI Pro account. Retrieving the access token is not part of the web client functionality or this library, it should ideally be fetched by the server and served to the web client using a REST call or similar mechanism.

## References

This TypeScript library is built on top of the official [powerbi-client](https://www.npmjs.com/package/powerbi-client) library provided by Microsoft and references some code from [PowerBI-Angular2](https://github.com/diego-d5000/PowerBI-Angular2) library.

## Donate

- **Paypal**: https://www.paypal.me/ramsi1983

- **Crypto**: Ethereum wallet address: 0xBeA952fc85c084C298CB3aC0cE198dD389488CB9
