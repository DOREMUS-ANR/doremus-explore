import { Component } from '@angular/core';
import { ScoreService } from './score.service';
import { SharedService } from '../../services/sharedService.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DomSanitizer, Title } from '@angular/platform-browser';

const defaultOverviewPic = '/static/img/bg/violin_string.jpg';
const organizBase = 'http://data.doremus.org/organization/';
const institutions = {
  Philharmonie_de_Paris: {
    label: 'Philharmonie de Paris',
    img: '/static/img/logos/philharmonie.png',
    uri: 'https://philharmoniedeparis.fr'
  },
  BnF: {
    label: 'BnF',
    img: '/static/img/logos/bnf.png',
    uri: 'http://catalogue.bnf.fr/'
  },
  Radio_France: {
    label: 'Radio France',
    img: '/static/img/logos/radiofrance.flat.png',
    uri: 'http://www.radiofrance.fr/'
  }
}
@Component({
  moduleId: module.id,
  templateUrl: './score.detail.template.html',
  styleUrls: ['./score.styl'],
  providers: [ScoreService]
})
export class ScoreDetailComponent {
  performers: any[];
  sharedService: SharedService;
  score: any;
  recording: any;
  recommendation: [any];
  querying: boolean;
  error: boolean = false;
  overviewPic: string = defaultOverviewPic;

  constructor(private titleService: Title,
    sharedService: SharedService,
    private scoreService: ScoreService,
    private route: ActivatedRoute, private _sanitizer: DomSanitizer) {

    this.sharedService = sharedService;

    this.route.params.forEach((params: Params) => {
      let id = params['id'];

      if (id) {
        this.querying = true;
        this.recording = null;
        this.scoreService.get(id).subscribe(exp => {
          this.score = exp['@graph'][0];
          this.score.uri = 'http://data.doremus.org/score/' + id;

          let name = this.score.name || this.score.alternateName;
          name == name['@value'] || name;
          this.score.name = name;
          this.titleService.setTitle(name);

          console.log(this.score);
          this.querying = false;
          this.error = false;

          this.overviewPic = defaultOverviewPic;
        }, (err) => {
          this.querying = false;
          this.error = true;
          console.error(err);
        });
      }
    });
  }

  ngOnInit() {
    // FIXME discover why this is not propagated to sharedService
    this.sharedService.sharchBarVisible = false;
  }

  isNode(a) {
    return a.startsWith('node');
  }

  getSource(source) {
    let s = source
      .replace('http://data.doremus.org/', '')
      .replace('organization/', '');

    let org = null;
    switch (s) {
      case 'bnf':
      case 'BnF':
        org = `BnF`; break;
      case 'philharmonie':
      case 'Philharmonie_de_Paris':
      case 'euterpe':
        org = `Philharmonie_de_Paris`; break;
      case 'redomi':
      case 'itema3':
      case 'Radio_France':
        org = `Radio_France`; break;
    }
    return institutions[org];
  }

  getProp(prop, asArray: boolean = false) {
    let v = this.score[prop];
    if (!v) return asArray ? [] : null;
    if (asArray && !Array.isArray(v)) return [v];
    return v;
  }

  getId(uri) {
    return uri.split('/').slice(-1)[0];
  }

  startsWithNum(what) {
    return parseInt(what[0]) != NaN;
  }

  safePic(input) {
    let uri = encodeURI(input);
    return this._sanitizer.bypassSecurityTrustStyle(`url('${uri}')`);
  }
}

function removeDuplicates(myArr: any[], prop: string) {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}
