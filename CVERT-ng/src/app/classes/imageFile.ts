export class ImageFile {

  path: string;
  color: "currentColor" | "primary" | "accent" | "warn";
  viewed: boolean;

  constructor(path) {
    this.path = path;
    this.color = "currentColor";
    this.viewed = false;
  }

}
