import Track from "./Track";
export default class Compose {
  public parent:any;
  public children: any[];
  public constructor() {
    this.parent = null;
    this.children = [];
  }
  add(obj:any) {
    obj.parent = this;
    this.children.push(obj);
  }
  update(t: Date) {
    this.children.forEach((ele) => {
      ele.update(t);
    });
  }
  // 基于时间轨的目标对象删除时间轨
  deleteByTarget(targrt) {
    const { children } = this;
    for (let child of children) {
      if (child.target === targrt) {
        children.delete(child);
        break;
      }
    }
  }
}
