// modeled after https://github.com/angular/angular/blob/cee2318110eeea115e5f6fc5bfc814cbaa7d90d8/modules/angular2/test/common/directives/ng_for_spec.ts
import { it, iit, describe, expect, inject, async, beforeEachProviders, fakeAsync, tick } from '@angular/core/testing';
import { TestComponentBuilder, ComponentFixture } from '@angular/compiler/testing';
import {Component, ViewChild, ContentChildren, QueryList} from '@angular/core';
import * as Infragistics from '../../src/main';

// HammerJS simulator from https://github.com/hammerjs/simulator, manual typings TODO
declare var Simulator: any;

export function main() {
    describe('Infragistics Angular2 List', function() {
         it('should initialize ig-list with item and header',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-list><ig-list-header></ig-list-header><ig-list-item></ig-list-item></ig-list>';
                return tcb.overrideTemplate(ListTestComponent, template)
                .createAsync(ListTestComponent)
                .then((fixture) => {                    
                    expect(fixture.componentInstance.viewChild).toBeDefined();
                    expect(fixture.componentInstance.viewChild instanceof Infragistics.List).toBeTruthy();
                    expect(fixture.componentInstance.viewChild.items).toBeUndefined();
                    expect(fixture.componentInstance.viewChild.headers).toBeUndefined();
                    fixture.detectChanges();

                    expect(fixture.componentInstance.viewChild.items instanceof QueryList).toBeTruthy();
                    expect(fixture.componentInstance.viewChild.items.length).toBe(1);
                    expect(fixture.componentInstance.viewChild.items.first instanceof Infragistics.ListItem).toBeTruthy();

                    expect(fixture.componentInstance.viewChild.headers instanceof QueryList).toBeTruthy();
                    expect(fixture.componentInstance.viewChild.headers.length).toBe(1);
                    expect(fixture.componentInstance.viewChild.headers.first instanceof Infragistics.ListHeader).toBeTruthy();
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));

         it('should initialize ig-list with search input attached',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<input id="searchInput"/><ig-list searchInputId="searchInput"></ig-list>';
                return tcb.overrideTemplate(ListTestComponent, template)
                .createAsync(ListTestComponent)
                .then((fixture) => {                    
                    expect(fixture.componentInstance.viewChild).toBeDefined();
                    fixture.detectChanges();
                    expect(fixture.componentInstance.viewChild._searchInputElement instanceof HTMLInputElement).toBeTruthy();
                    expect(fixture.componentInstance.viewChild.searchInputId).toBe("searchInput");
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));

         it('should filter properly',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-list><ig-list-item>Item 1</ig-list-item><ig-list-item>Item 2</ig-list-item><ig-list-item>Item 3</ig-list-item></ig-list>';
                return tcb.overrideTemplate(ListTestComponent, template)
                .createAsync(ListTestComponent)
                .then((fixture) => {                    
                    var items, visibleItems;

                    fixture.detectChanges();
                    expect(fixture.componentInstance.viewChild.items.length).toBe(3);
                    items = fixture.componentInstance.viewChild.items.toArray();

                    for (let item of items) {
                        expect(item instanceof Infragistics.ListItem).toBeTruthy();
                    }

                    visibleItems = items.filter((listItem) => { return !listItem.hidden; });

                    expect(visibleItems.length).toBe(3);
                    
                    fixture.componentInstance.viewChild._searchInputElement = document.createElement('input');
                    fixture.componentInstance.viewChild._searchInputElement.value = "1";
                    fixture.detectChanges();

                    fixture.componentInstance.viewChild.filter();
                    fixture.detectChanges();

                    visibleItems = items.filter((listItem) => { return !listItem.hidden; });
                    expect(visibleItems.length).toBe(1);
                    expect(visibleItems[0] instanceof Infragistics.ListItem).toBeTruthy();
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));

         it('should set/get properly layout properties: width, left, maxLeft',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<div #wrapper><ig-list><ig-list-item></ig-list-item></ig-list></div>';
                return tcb.overrideTemplate(ListTestComponent, template)
                .createAsync(ListTestComponent)
                .then((fixture) => {       
                    var item, visibleAreaOnFullPan , testWidth = 400, testLeft = -100;
                    fixture.componentInstance.wrapper.nativeElement.style.width = testWidth + "px";
                    fixture.detectChanges();
                    expect(fixture.componentInstance.viewChild.items.length).toBe(1);

                    item = fixture.componentInstance.viewChild.items.first;
                    visibleAreaOnFullPan = item._VISIBLE_AREA_ON_FULL_PAN;

                    expect(item instanceof Infragistics.ListItem).toBeTruthy();
                    expect(item.width).toBe(testWidth);
                    expect(item.left).toBe(0);
                    expect(item.maxLeft).toBe(visibleAreaOnFullPan - testWidth);

                    item.left = testLeft;
                    expect(item.left).toBe(testLeft);

                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));

         // end of tests
    });
}

@Component({
    selector: 'test-cmp',
    template: '<div></div>', //"Component 'TestComponent' must have either 'template' or 'templateUrl' set."
    directives: [
        Infragistics.List, 
        Infragistics.ListItem, 
        Infragistics.ListHeader]
})
class ListTestComponent {
     @ViewChild(Infragistics.List) public viewChild: Infragistics.List;
     @ViewChild("wrapper") public wrapper: HTMLElement;
}

@Component({
    selector: 'test-cmp', 
    template: '<div></div>', //"Component 'TestComponent' must have either 'template' or 'templateUrl' set."
    directives: [Infragistics.ListHeader]
})
class ListHeaderTestComponent {
     @ViewChild(Infragistics.ListHeader) public viewChild: Infragistics.ListHeader;
}

@Component({
    selector: 'test-cmp', 
    template: '<div></div>', //"Component 'TestComponent' must have either 'template' or 'templateUrl' set."
    directives: [Infragistics.ListItem]
})
class ListItemTestComponent {
     @ViewChild(Infragistics.ListItem) public viewChild: Infragistics.ListItem;
}

//class TestComponentPin extends TestComponentDI {
     //pin: boolean = true;
     //enableGestures: string = "";
//}