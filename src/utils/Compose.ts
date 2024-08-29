import Track from "./Track";
export default class Compose {
  public parent!: Compose;
  public children: Track[];
  public constructor() {
    // this.parent = null;
    this.children = [];
  }
  add(obj:Track) {
    obj.parent = this;
    this.children.push(obj);
  }
  update(t: Date) {
    this.children.forEach((ele) => {
      ele.update(t);
    });
  }
}
