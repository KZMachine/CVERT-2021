export class Filter {

  filter: any;
  name: string;

  constructor(filter) {
    this.name = "New Filter";
    this.filter = JSON.parse(JSON.stringify(filter));
  }

}
