import { FormBuilder } from '@angular/forms';
import { CapacityManagementComponent } from './capacity-management.component';

describe('CapacityManagementComponent - updateSchedule', () => {
  let component: CapacityManagementComponent;
  let updateSingleDaySpy: jasmine.Spy;

  beforeEach(() => {
    component = new CapacityManagementComponent(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      new FormBuilder(),
      {} as any,
      {} as any
    );
    (component as any).loadal = { show: () => {}, hide: () => {} };
    updateSingleDaySpy = spyOn<any>(component, 'updateSingleDay').and.resolveTo(true);
    spyOn<any>(component, 'loadInventoryPoolData').and.resolveTo(undefined);
  });

  function buildDays(activeDays: number[]): any[] {
    return Array.from({ length: 7 }, (_, index) => ({
      day: index,
      index,
      passesRequired: activeDays.includes(index),
      defaultCapacity: activeDays.includes(index) ? 10 : 0
    }));
  }

  it('only applies capacity to checked days-of-week (Mon 2026-09-14 to Sun 2026-09-20, Mon+Fri checked)', async () => {
    const start = new Date('2026-09-14T00:00:00Z');
    const end = new Date('2026-09-20T00:00:00Z');
    const days = buildDays([1, 5]); // Monday, Friday

    await (component as any).updateSchedule(start, end, days, [], false, [], false);

    expect(updateSingleDaySpy).toHaveBeenCalledTimes(2);
    const calledDaysOfWeek = updateSingleDaySpy.calls.allArgs().map((args: any[]) => args[0].date.getUTCDay());
    expect(calledDaysOfWeek.sort()).toEqual([1, 5]);
  });

  it('skips unchecked days entirely instead of writing zero capacity', async () => {
    const start = new Date('2026-09-14T00:00:00Z');
    const end = new Date('2026-09-20T00:00:00Z');
    const days = buildDays([1]); // only Monday checked

    await (component as any).updateSchedule(start, end, days, [], false, [], false);

    expect(updateSingleDaySpy).toHaveBeenCalledTimes(1);
    expect(updateSingleDaySpy.calls.mostRecent().args[1]).toBe(10);
  });

  it('never touches inventory when no day-of-week is checked', async () => {
    const start = new Date('2026-09-14T00:00:00Z');
    const end = new Date('2026-09-20T00:00:00Z');
    const days = buildDays([]);

    await (component as any).updateSchedule(start, end, days, [], false, [], false);

    expect(updateSingleDaySpy).not.toHaveBeenCalled();
  });
});
