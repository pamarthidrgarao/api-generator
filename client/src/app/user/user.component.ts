import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  username = 'Nagarjuna Tamarada';
  sideBar = 'active';
  constructor() { }

  ngOnInit() {
  }

  toggle() {
    if (this.sideBar) {
      this.sideBar = null;
    } else {
      this.sideBar = 'active';
    }
  }

}
