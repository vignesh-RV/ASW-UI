import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'age'
})
export class Age implements PipeTransform {
  transform(value: any): any {
    if (value !== undefined || value !== null || value > 0 || value < 0) {
      return new Date().getFullYear() - new Date(value).getFullYear();
    }
    return Number(0);
  }
}