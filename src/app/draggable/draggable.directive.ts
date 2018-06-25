import { Directive, HostBinding, HostListener, EventEmitter, Output } from "@angular/core";

@Directive({
  selector: "[appDraggable]"
})
export class DraggableDirective {
  @HostBinding('class.draggable') draggable = true;

  // to trigger pointer-events polyfill 
  @HostBinding('attr.touch-action') touchAction = 'none';

  @Output() dragStart = new EventEmitter<PointerEvent>();
  @Output() dragMove = new EventEmitter<PointerEvent>();
  @Output() dragEnd = new EventEmitter<PointerEvent>();

  @HostBinding('class.dragging') dragging = false;

  @HostListener('pointerdown', ['$event']) onPointerDown(event: PointerEvent): void {
    this.dragging = true; 
    this.dragStart.emit(event);
  }

  @HostListener('document:pointermove', ['$event']) onPointerMove(event: PointerEvent): void {
    // if this.dragging === true 
    if (!this.dragging){
      return;
    }
    // console.log('drag move!');
    this.dragMove.emit(event);
  }

  @HostListener('document:pointerup', ['$event']) onPointerUp(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }

    this.dragging = false; 
    this.dragEnd.emit(event);
  }


  // pointerdown => dragStart
  // document => pointermove => dragMove
  // document => pointerup => dragEnd

}
