import { MonoTypeOperatorFunction, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * @deprecated doesn't work with Ivy, will be removed in v1.0
 */
export function takeUntilDestroy<T>(component: any): MonoTypeOperatorFunction<T> {
  const proto = Object.getPrototypeOf(component);
  const onDestroy = proto.ngOnDestroy;
  const destroy$ = new Subject<void>();

  proto.ngOnDestroy = function () {
    // eslint-disable-next-line prefer-rest-params
    onDestroy.apply(this, arguments);

    destroy$.next();
    destroy$.complete();
  };

  return takeUntil<T>(destroy$);
}
