  import * as dat from "dat.gui";
  import Snap from "snapsvg";

  class GuiControl {
    public dot_radius: number;
    // vertical/horizontal distance between dots
    public distance: number;
    // how many odd rows are shifted for x direction (in px)
    public row_shift: number;
    public dot_color: string;
    public bg_color: string;
    public random_fade: boolean;

    // generates hex color randomly
    public random_color = () => {
      let hexset: string = "0123456789abcdef";
      let new_dot_color: string = "#";
      let new_bg_color: string = "#";
      for (let i = 0; i < 6; i++){
        new_dot_color += hexset[Math.floor(Math.random() * 16)];
        new_bg_color += hexset[Math.floor(Math.random() * 16)];
      }

      this.dot_color = new_dot_color;
      this.bg_color = new_bg_color;
      change_dot_color(this.dot_color);
      change_bg_color(this.bg_color);
    }

    public swap_color = () => {
      let tmp = this.dot_color;
      this.dot_color = this.bg_color;
      this.bg_color = tmp;

      change_dot_color(this.dot_color);
      change_bg_color(this.bg_color);
    }

    constructor(dot_radius: number, distance: number, row_shift: number, dot_color: string, bg_color: string, random_fade: boolean) {
      this.dot_radius = dot_radius;
      this.distance = distance;
      this.row_shift = row_shift;
      this.dot_color = dot_color;
      this.bg_color = bg_color;
      this.random_fade = random_fade;
    }


  }

  var gui: any;
  var control: GuiControl;
  var row_shift_control: any;
  var s: any;

  var circles: any[] = [];
  var background: any = null;

  var window_height: number;
  var window_width: number;

  var timer: any;

  window.addEventListener("load", (e)=> {init();});

  function init(): void {
    console.log("initialize...");

    gui = new dat.GUI();
    control = new GuiControl(12, 12, 25, "#00ffa0", "#000822", false);
    gui.add(control, "dot_radius", 1, 100, 1).onChange(change_pattern_param);
    gui.add(control, "distance", 0, 50, 1).onChange(change_pattern_param);
    row_shift_control = gui.add(control, "row_shift", 0, 150, 1).onChange(change_pattern_param);
    gui.addColor(control, "dot_color").listen().onChange(change_dot_color);
    gui.addColor(control, "bg_color").listen().onChange(change_bg_color);
    gui.add(control, "random_color");
    gui.add(control, "swap_color");
    gui.add(control, "random_fade").onChange(set_animation);

    s = Snap("#draw_area");

    background = s.rect(0, 0, "100%", "100%");
    background.attr(
      {
        fill: control.bg_color
      }
    );

    let row_max = Math.floor(s.node.clientHeight / (2 * control.dot_radius + control.distance)) + 1;
    let col_max = Math.floor(s.node.clientWidth / (2 * control.dot_radius + control.distance)) + 1;

    // create initial canvas status
    for (let row = 0; row < row_max; row++){
      let tmp_array = [];
      for (let col = (row % 2) == 0 ? 0 : -1; col < col_max; col++){
        let tmp = s.circle(
          col * (control.distance + 2 * control.dot_radius) + (row % 2) * control.row_shift,
          row * (control.distance + 2 * control.dot_radius),
          control.dot_radius
        );
        tmp.attr(
          {
            fill: control.dot_color,
            opacity: 1
          }
        );
        tmp_array.push(tmp);
      }
      circles.push(tmp_array);
    }
    return;
  }

  function change_pattern_param(): void {
    row_shift_control.max(2 * control.dot_radius + control.distance);
    row_shift_control.updateDisplay();

    for (let row = 0; row < circles.length; row++){
      for (let col = 0; col < circles[row].length; col++){

        circles[row][col].attr(
          {
            r: control.dot_radius,
            cx: ((row % 2) == 0 ? col : col - 1) * (control.distance + 2 * control.dot_radius) + (row % 2) * control.row_shift,
            cy: row * (control.distance + 2 * control.dot_radius)
          }
        );
      }
    }

    // if needed, create or delete some
    let row_max = Math.floor(s.node.clientHeight / (2 * control.dot_radius + control.distance)) + 1;
    let col_max = Math.floor(s.node.clientWidth / (2 * control.dot_radius + control.distance)) + 1;

    // row del
    while (circles.length > row_max){
      while (circles[circles.length - 1].length > 0){
        circles[circles.length - 1].pop().remove();
      }
      circles.pop();
    }
    // col del
    for (let row = 0; row < circles.length; row++){
      let col_limit = (row % 2) == 0 ? col_max : col_max + 2;
      while (circles[row].length > col_limit){
        circles[row].pop().remove();
      }
    }

    // col create
    for (let row = 0; row < circles.length; row++){
      let col_limit = (row % 2) == 0 ? col_max + 1 : col_max + 2;
      for (let col = circles[row].length; col < col_limit; col++){
        let tmp = s.circle(
          col * (control.distance + 2 * control.dot_radius) + (row % 2) * control.row_shift,
          row * (control.distance + 2 * control.dot_radius),
          control.dot_radius
        );
        tmp.attr(
          {
            fill: control.dot_color,
            opacity: 1
          }
        );
        circles[row].push(tmp);
      }
    }

    // row create
    for (let row = circles.length; row < row_max + 1; row++){
      let tmp_array = [];
      for (let col = (row % 2) == 0 ? 0 : -1; col < col_max; col++){
        let tmp = s.circle(
          col * (control.distance + 2 * control.dot_radius) + (row % 2) * control.row_shift,
          row * (control.distance + 2 * control.dot_radius),
          control.dot_radius
        );
        tmp.attr(
          {
            fill: control.dot_color,
            opacity: 1
          }
        );
        tmp_array.push(tmp);
      }
      circles.push(tmp_array);
    }

    return;
  }

  function change_dot_color(new_value: string): void {
    for (let row of circles){
      for (let circle of row){
        circle.attr(
          {
            fill: new_value
          }
        );
      }
    }
    return;
  }

  function change_bg_color(new_value: string): void {
    background.attr(
      {
        fill: new_value
      }
    );
    return;
  }

  function set_animation(new_value: boolean): void {
    if (new_value){
      // set timer
      timer = setInterval(
        () => {
          let r: number = Math.floor(Math.random() * circles.length);
          let c: number = Math.floor(Math.random() * circles[0].length);
          circles[r][c].animate(
            {opacity: circles[r][c].attr("opacity")==1?0:1},
            250,
            mina.easein
          );
        },
        250
      );
    }else{
      clearInterval(timer);
    }
  }
