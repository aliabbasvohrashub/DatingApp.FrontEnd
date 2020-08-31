import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";

export class AuthInterceptor implements HttpInterceptor {
    constructor(private router: Router) {

    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (localStorage.getItem('token') != null) {
            const cloneReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${localStorage.getItem('token')}`)
            });
            return next.handle(cloneReq).pipe(
                tap(suc => {

                },
                    err => {
                        if (err.status == 405) {
                            localStorage.removeItem('token');
                            localStorage.clear();
                            this.router.navigateByUrl['/'];
                        }
                    })
            );
        }
        else {
            return next.handle(req.clone())
        }
    }
}
