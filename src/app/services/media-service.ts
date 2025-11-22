import {Injectable} from '@angular/core';
import axios from 'axios';
import {FileUpload} from '../models/Media';

@Injectable({
    providedIn: 'root',
})
export class MediaService {

    private apiPathBase = "http://localhost:8080/api/v1/movie";

    getAllMedias() {
        axios.get(this.apiPathBase + "/all")
            .then(function (res) {
                console.log(res);
            })
            .catch(function (reject) {
                console.log(reject);
            })
            .finally(function () {
                console.log("Finally request to get all media.");
            })
    }

    getSignatureMedia() {
        axios.post(this.apiPathBase + "/upload-session", new FileUpload("mi_file.png"))
            .then(function (res) {
                console.log(res);
            })
    }
}
