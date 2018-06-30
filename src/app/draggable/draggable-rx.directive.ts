import {
  Directive,
  HostBinding,
  HostListener,
  EventEmitter,
  Output,
  OnInit
} from "@angular/core";
import { Subject } from "rxjs/Subject";
import { merge } from 'rxjs/observable/merge';
import { fromEvent } from 'rxjs/observable/fromEvent';

import { repeat, switchMap, take, takeUntil, mapTo } from "rxjs/operators";

@Directive({
  selector: "[appDraggableRx]"
})
export class DraggableRxDirective implements OnInit {
  @HostBinding("class.draggable") draggable = true;
  @HostBinding("class.dragging") dragging = false;

  // to trigger pointer-events polyfill
  @HostBinding("attr.touch-action") touchAction = "none";

  @Output() dragStart = new EventEmitter<PointerEvent>();
  @Output() dragMove = new EventEmitter<PointerEvent>();
  @Output() dragEnd = new EventEmitter<PointerEvent>();

  private pointerDown = new Subject<PointerEvent>();
  private pointerMove = new Subject<PointerEvent>();
  private pointerUp = new Subject<PointerEvent>();

  @HostListener("pointerdown", ["$event"])
  onPointerDown(event: PointerEvent): void {
    this.pointerDown.next(event);
  }

  @HostListener("document:pointermove", ["$event"])
  onPointerMove(event: PointerEvent): void {
    this.pointerMove.next(event);
  }

  ngOnInit(): void {
    // stream of dragStart
    const dragStart$ = this.pointerDown.asObservable();

    // stream of dragMove
    this.pointerDown
      .pipe(
        switchMap(() => this.pointerMove),
        takeUntil(this.pointerUp),
        repeat()
      )
      .subscribe(this.dragMove);

    // stream to dragEnd
    this.pointerDown
      .pipe(
        switchMap(() => this.pointerUp),
        take(1),
        repeat()
      )
      .subscribe(this.dragEnd);

    // dragging true / false

    // dragging true/false
    merge(
        this.dragStart.pipe(mapTo(true)),
        this.dragEnd.pipe(mapTo(false))
      ).subscribe(dragging => {
        this.dragging = dragging;
      });
  }
}
