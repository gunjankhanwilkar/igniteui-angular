import { Directive, HostBinding, ViewContainerRef } from '@angular/core';
import { IgxChipComponent } from '../../chips';
import { IgxInputGroupComponent } from '../../input-group';

@Directive({
    selector: 'igx-suffix,[igxSuffix]'
})
export class IgxSuffixDirective {
    @HostBinding('class.igx-input-group__bundle-suffix')
    public childOfInputGroup = false;

    @HostBinding('class.igx-chip__suffix')
    public childOfChip = false;

    constructor(private _viewContainerRef: ViewContainerRef) {
        this.childOfChip = !!this._viewContainerRef.parentInjector.get(IgxChipComponent, null);
        this.childOfInputGroup = !!this._viewContainerRef.parentInjector.get(IgxInputGroupComponent, null);
    }
}
