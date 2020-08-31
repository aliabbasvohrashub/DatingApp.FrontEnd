import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../_models/user';
import { AuthService } from '../../_services/auth.service';
import { UserService } from '../../_services/user.service';
import { AlertifyService } from '../../_services/alertify.service';
import { from, of, observable, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  @Input() user: User;

  constructor(private authService: AuthService, private userService: UserService, private alertify: AlertifyService) { }

  ngOnInit() {

    // from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    //   .pipe(
    //     map(x => x * 2),
    //     filter(x => x > 8)
    //   )
    //   .subscribe(x => console.log(x));

    
    // Observable.create([1, 2, 3, 4, 5])
    //   .map(x => x * 2)
    //   .filter(x => x > 5)
    //   .subscribe(x => console.log(x));
  }

  sendLike(id: number) {
    this.userService.sendLike(this.authService.decodedToken.nameid, id).subscribe(data => {
      this.alertify.success('You have liked: ' + this.user.knownAs);
    }, error => {
      this.alertify.error(error);
    });
  }

}
