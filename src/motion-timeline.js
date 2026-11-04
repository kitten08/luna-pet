// Sample normalized body controls and prop tracks at a time in seconds.
const TAU = 2 * Math.PI;
const clamp = (n, low = 0, high = 1) => Math.max(low, Math.min(high, n));
const mix = (a, b, w) => a + (b - a) * w;
const ramp = (t, a, b) => {
  const x = clamp((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const gate = (t, a, b, fade = .55) => ramp(t, a, a + fade) * (1 - ramp(t, b - fade, b));
const pulse = (t, center, radius) => {
  const x = clamp(1 - Math.abs(t - center) / radius);
  return x * x * (3 - 2 * x);
};
const wave = (t, rate, phase = 0) => Math.sin(TAU * (t * rate + phase));

export function sampleMotion(motion, seconds) {
  const t = clamp(seconds, 0, motion.duration);
  const e = gate(t, .25, motion.duration - .12, .9);
  const v = motion.variation;
  const props = motion.prop.split('|').filter(Boolean);
  const p = {
    rise: 0, shift: 0, lean: 0, head: 0, squash: 0, depth: 1,
    blink: 0, wink: 0, mouth: 0, blush: 0, tears: 0,
    left: null, right: null, stepL: 0, stepR: 0, props: [], outfitTurn: false
  };
  const left = (x, y, form = 'soft', w = e) => { p.left = {x, y, form, w}; };
  const right = (x, y, form = 'soft', w = e) => { p.right = {x, y, form, w}; };
  const prop = (id, x, y, size, alpha = e, rotation = 0) => {
    if (id && alpha > .003) p.props.push({id, x, y, size, alpha: clamp(alpha), rotation});
  };
  const trail = (id, start, gap, count, x, y, dx, dy, size) => {
    for (let i = 0; i < count; i++) {
      const age = (t - start - i * gap) / 2;
      if (age <= 0 || age >= 1) continue;
      prop(id, x + age * dx + .034 * wave(age, 1, i * .17), y + age * dy,
        size * mix(.6, 1.05, age), Math.sin(Math.PI * age) * .78, .24 * wave(age, .4, i));
    }
  };

  switch (motion.kind) {
    case 'doze': {
      const nod = gate(t, 1, 9.4) * (.75 + .25 * wave(t, .46));
      p.blink = nod;
      p.head = .12 * nod;
      p.squash = .045 * nod;
      p.rise = v === 'float' ? (.015 + .014 * wave(t, .48)) * e : 0;
      if (v === 'float') trail('Zzz', 2, 1.05, 5, .59, .055, .14, -.17, .13);
      else {
        const shock = pulse(t, 5.3, .54);
        p.blink *= 1 - ramp(t, 4.8, 5.15);
        p.rise += .11 * shock;
        p.mouth = shock;
        p.blush = pulse(t, 7, 2);
        right(.69, .48, 'soft', gate(t, 5, 8.7));
        prop('!', .7, -.04, .18, shock);
      }
      break;
    }
    case 'steps': {
      const rate = v === 'trip' ? 2.35 : v === 'crab' ? 1.65 : 1.25;
      const gait = wave(t, rate);
      const fast = gate(t, v === 'trip' ? 1.6 : .6, v === 'trip' ? 7.5 : 9.55);
      p.stepL = gait * .068 * fast;
      p.stepR = -p.stepL;
      p.rise = Math.abs(gait) * .035 * fast;
      p.lean = v === 'crab' ? -.13 * fast : .035 * gait * fast;
      p.head = v === 'wait' ? wave(t, .32) * .12 * e : -.035 * gait * fast;
      p.depth = v === 'trip' ? 1 - fast * .22 : 1;
      left(.29 + gait * .055, .7 + gait * .045, 'soft', fast);
      right(.74 + gait * .055, .69 - gait * .045, 'soft', fast);
      if (v === 'trip') {
        p.lean += -.27 * pulse(t, 7.75, .82);
        p.squash += .12 * pulse(t, 8.05, .9);
        p.mouth = pulse(t, 7.8, .84);
        prop('💡', .66, -.06, .17, pulse(t, 1.6, 1.25));
      }
      if (v === 'wait') {
        left(.48, .68, 'soft', e); right(.56, .68, 'soft', e);
        prop('⌛', .68, -.05 + .025 * wave(t, .7), .16, e, .35 * wave(t, .45));
      }
      break;
    }
    case 'jump': {
      const leap = pulse(t, 2.9, .95) + (v === 'clap' ? pulse(t, 5.9, .87) : 0);
      p.rise = .17 * leap;
      p.squash = .065 * (pulse(t, 1.97, .48) + pulse(t, 4.05, .42));
      p.mouth = .72 * leap;
      p.blink = .8 * leap;
      p.blush = .45 * e;
      const close = v === 'clap' ? pulse(t, 5.87, .65) : 0;
      left(.23 + .25 * close, .27 - .2 * leap, 'open', gate(t, 1.7, 7.6));
      right(.82 - .27 * close, .27 - .2 * leap, 'open', gate(t, 1.7, 7.6));
      if (v === 'grab') {
        prop('★', .53, -.095, .19, gate(t, .9, 2.9, .45), .3);
        trail('✧', 2.8, .13, 6, .51, -.045, .29, -.14, .095);
      } else {
        prop(props[0], .52, -.07 - .035 * leap, .22, pulse(t, 3.1, 1.7), -.15);
        if (v === 'clap') trail('✧', 5.7, .14, 6, .49, -.06, .31, -.13, .1);
      }
      break;
    }
    case 'face': {
      const s = wave(t, .58);
      const jerk = pulse(t, 2.1, .58);
      p.head = .055 * s * e;
      if (['wave', 'both-wave', 'peace'].includes(v)) {
        right(.79 + .09 * s, .29 + .021 * s, v === 'peace' ? 'peace' : 'open');
        if (v === 'both-wave') left(.24 - .08 * s, .22 - .026 * s, 'open');
        p.wink = v === 'peace' ? gate(t, 2.2, 7.6) : pulse(t, 6.6, .28);
        p.blush = .32 * e;
        p.mouth = .28 * e;
      } else if (['laugh','tickle','shy','shy-fingers','hand-heart'].includes(v)) {
        const hands = v === 'shy-fingers' ? [.48,.58,.45,'point']
          : v === 'hand-heart' ? [.47,.59,.62,'heart']
          : v === 'shy' ? [.46,.59,.39,'soft'] : [.4,.64,.408,'soft'];
        left(hands[0], hands[2], hands[3]); right(hands[1], hands[2], hands[3]);
        p.blush = .8 * e;
        p.blink = ['laugh', 'tickle', 'shy'].includes(v) ? e : .75 * pulse(t, 4.4, .33);
        p.mouth = v === 'laugh' || v === 'tickle' ? (.55 + .15 * wave(t, 2.5)) * e : .14 * e;
        if (v === 'tickle') { p.lean = .14 * s * e; p.squash = .055 * (1 + s) * e; }
        if (v === 'hand-heart') prop('♥', .53, .595, .09, .65 * e);
      } else if (['huff','arms-crossed'].includes(v)) {
        left(.625, .595, 'fist'); right(.435, .625, 'fist');
        p.depth = v === 'huff' ? 1 - .22 * e : 1;
        p.lean = -.075 * e;
        p.blink = .92 * e;
        p.mouth = -.55 * e;
      } else if (v === 'teary') {
        left(.451, .555, 'fist'); right(.605, .555, 'fist');
        p.tears = e; p.mouth = -.56 * e; p.blush = .43 * e;
        p.head = .09 * e;
        p.squash = (.023 + .008 * wave(t, 2.1)) * e;
      } else if (v === 'think-finger') {
        right(.58, .421, 'point'); p.head = -.105 * e;
        p.blink = pulse(t, 5.3, .32); p.mouth = -.1 * e;
      } else {
        right(v === 'error' ? .69 : .552, v === 'error' ? .29 : .435, 'soft', gate(t, 1.55, 8.35));
        p.mouth = v === 'error' ? -.4 * e : .74 * e;
        p.tears = v === 'error' ? .75 * e : 0;
        p.rise = jerk * .1;
        p.lean = -.075 * jerk;
      }
      if (props[0]) prop(props[0], .67, -.035, .18, v === 'startle' ? pulse(t, 2.2, 1.2) : e * .75);
      break;
    }
    case 'hang':
      p.rise = .14 * e;
      p.head = (.06 + .045 * wave(t, .62)) * e;
      p.lean = .046 * wave(t, .47) * e;
      p.stepL = .035 * wave(t, .72) * e;
      p.stepR = -.8 * p.stepL;
      left(.27 + .06 * wave(t,.52), .765, 'soft');
      right(.79 + .06 * wave(t,.52), .775, 'soft');
      break;
    case 'bow':
    case 'crouch':
    case 'stretch': {
      const bend = gate(t, 1.2, 8.75, 1.45);
      const high = motion.kind === 'stretch';
      p.squash = (high ? -.034 : motion.kind === 'crouch' ? .19 : .10) * bend;
      p.lean = (high ? -.048 : .105) * bend;
      p.head = high ? -.06 * bend : .12 * bend;
      p.blink = bend;
      p.mouth = high ? gate(t, 1.6, 5.45) * .88 : 0;
      left(high ? .17 : .32, high ? (v === 'rub' ? .40 : .105) : .744, high ? 'open' : 'fist', bend);
      right(high ? (v === 'rub' ? .65 : .89) : .75, high ? (v === 'rub' ? .3+.02*wave(t,2) : .09) : .744, high ? 'open' : 'fist', bend);
      p.tears = v === 'rub' ? .32 * pulse(t, 4.6, 1.7) : 0;
      break;
    }
    case 'look':
    case 'turn':
    case 'dance': {
      if (motion.kind === 'look') {
        const angle = mix(-1, 1, ramp(t, 1.9, 8.3));
        p.head = .1 * angle; p.lean = .048 * angle; p.depth = 1 - .11 * Math.abs(angle);
      } else if (motion.kind === 'turn') {
        const phase = ramp(t, .95, v === 'wardrobe' ? 4.55 : 7.5)
          + (v === 'wardrobe' ? ramp(t, 6.5, 9.2) : 0);
        p.depth = Math.cos(TAU * phase);
        p.outfitTurn = v === 'wardrobe' && t > 2.9 && t < 7.8;
        p.head = .087 * Math.sin(TAU * phase);
        p.rise = .082 * pulse(t, 8.1, .67);
        left(.31, .73, 'fist'); right(.746, .73, 'fist');
        prop(props[0], .73, .15, .16, pulse(t, 3.1, 1.3)+pulse(t,7.7,1.3));
      } else {
        const rate = v === 'waltz' ? .47 : v === 'heart' ? 1.04 : .82;
        const s = wave(t, rate);
        p.head = (v === 'lion' ? .105 : .065) * s * e;
        p.lean = .105 * s * e;
        p.rise = (v === 'waltz' ? .033 : .068) * Math.abs(s) * e;
        p.stepL = s * .055 * e; p.stepR = -p.stepL;
        if (v === 'waltz') p.depth = 1 - .42 * pulse(t, 5.1, 2.15);
        const close = v === 'heart' ? (.5 + .5 * s) : 0;
        left(.23 + .24 * close, .51 + .12 * s, v === 'heart' ? 'heart' : 'open');
        right(.8 - .21 * close, .51 - .12 * s, v === 'snap' ? 'point' : 'open');
        if (v === 'lion') prop('lion', .53, mix(.65,.22,ramp(t, 1.1, 3.5)), .48, e, .22*s);
        else trail(props[0], 2, .81, 7, .65, .08, .19, -.17, .14);
        p.wink = v === 'heart' ? pulse(t, 8.2, .46) : 0;
      }
      break;
    }
    case 'food': {
      const eating = gate(t, 2.55, 8.55, .7);
      const chew = Math.max(0, wave(t - 2.43, v === 'feast' ? .98 : v === 'slurp' ? .73 : .54));
      const bite = chew * chew * eating;
      const hold = gate(t, .75, v === 'hide' ? 5.2 : 9.6, .65);
      const bowl = ['rice','🍜','🍚','🥣','🍲','tangyuan','🦀'].includes(props[0]);
      const sw = v === 'alternate' ? .1 * wave(t,.42) : v === 'seeds' ? .045 : 0;
      const handX = mix(.65 + sw, .555, bite), handY = mix(.648, .427, bite);
      p.head = (.07 + .045 * chew) * eating;
      p.mouth = .67 * bite + .23 * Math.max(0, wave(t, 2.9)) * eating;
      p.blink = .94 * pulse(t, 6.4, 1.9);
      p.blush = (v === 'hot' ? .8 : .34) * eating;
      p.squash = v === 'feast' ? .11 * e : .02 * eating;
      left(.422,.635,'soft',hold);
      right(handX,handY,'fist',hold);
      if (bowl) {
        prop(props[0], .509,.652,.255,hold);
        prop(v === 'rice-cake' ? 'hammer' : ['noodles','slurp','stir','hot'].includes(v) ? 'sticks' : 'spoon',
          handX-.035,handY-.04,.13,hold,-.85+.55*bite);
        if (['dip','noodles','slurp','stir','hot','blow'].includes(v)) trail('steam',2,.76,8,.5,.6,.08,-.16,.095);
      } else prop(props[0],handX-.043,handY-.055,v === 'feast' ? .19 : .155,hold,.18 * wave(t,.44));
      for (let i=1;i<props.length;i++) prop(props[i],.28+i*.18,.77,.155,hold);
      if (v === 'moon') prop('🌕', .88, .0, .24, gate(t,1.4,9.55));
      if (v === 'lucky') prop('coin', .52,.52,.12,pulse(t,6.8,1.15));
      if (v === 'flag') prop('⚑', .64,.55-.25*pulse(t,7.5,.9),.14,hold);
      if (v === 'melt' || v === 'seeds') trail(v === 'melt' ? 'drop' : '·',4.3,.32,5,.61,.59,.06,.23,.08);
      if (v === 'hide') { p.lean = -.09 * pulse(t,5.1,1.6); p.mouth += .55 * pulse(t,5.1,.43); }
      if (v === 'choke') { p.mouth += .63 * pulse(t,5.1,.37); p.rise = .037 * pulse(t,5.25,.62); }
      if (['unwrap','split','shell','pound','glow','bite'].includes(v)) {
        prop(v === 'pound' ? 'hammer' : '✧', .55,.57,.15,pulse(t, v === 'bite' ? 5.9 : 2.8,1.1));
      }
      break;
    }
    case 'work':
    case 'think':
    case 'balance': {
      const doing = gate(t, 1.1, 8.9, .72);
      const handBeat = wave(t, v === 'code' || v === 'tasks' ? 3.2 : v === 'wipe' ? .9 : 1.44);
      const tap = (.5+.5*handBeat)*doing;
      if (motion.kind === 'think') {
        p.head = (.075 + .035 * wave(t,.27)) * doing;
        p.blink = pulse(t,5.4,.24)+pulse(t,8.1,.28);
        if (v === 'daze') {
          p.head = (.12 + .025 * wave(t,.18)) * doing;
          p.blink = .68 * doing;
          p.squash = .046 * doing;
          p.mouth = .13 * Math.max(0,wave(t,1.12)) * doing * (1 - pulse(t,5.35,.63));
        }
        if (v === 'chat') {
          p.head = .055 * wave(t,.88) * doing;
          p.mouth = (.14 + .26 * Math.max(0,wave(t,2.7))) * doing * (1 - pulse(t,4.95,.49));
          right(.72,.6-.06*wave(t,.65),'open',gate(t,3,7.8));
        }
        if (v !== 'daze' && v !== 'chat') right(.565,.448,'point',doing);
        props.forEach((item, i) => prop(v === 'focus' ? item : 'bubble:'+item,.55+.12*wave(t,.18,i*.24),-.065,
          v === 'focus' ? .17 : .36,gate(t,1.8+i*2.05,4.5+i*2.05,.55)));
        if (v === 'focus') trail('✧',3,.45,5,.73,.17,.18,-.15,.07);
      } else if (motion.kind === 'balance') {
        const beat = pulse(t,2.3,.37)+pulse(t,3.15,.37)+(v==='flat'?pulse(t,3.86,.37):0);
        right(.73,.37-.12*beat,'point',gate(t,1.15,4.6));
        p.head = ['empty','flat','count'].includes(v) ? .1*e : -.055*e;
        p.mouth = ['empty','flat','count'].includes(v) ? -.46*e : .21*e;
        p.blink = v === 'count' ? pulse(t,6.15,1.35) : .1;
        const bag = v === 'flat' ? 'flat-bag' : v === 'empty' ? 'empty-bag' : props[0];
        prop(bag,.55,-.06,.23,gate(t,2.4,9.55),v==='jingle'?.17*wave(t,2.4):.05*wave(t,.6));
        if (['overflow','count','jingle','steady'].includes(v)) trail('coin',3.8,.31,
          v==='overflow'?8:v==='count'?4:3,.58,.01,.16,.21,.09);
      } else {
        const lift = ['grimace','peek','corsage','greet'].includes(v) ? pulse(t,5.05,2) : 0;
        const wide = v === 'wipe' ? .19*handBeat : v === 'knock' ? .025 : .06*handBeat;
        left(.397-wide,.645+.027*handBeat,'soft',doing);
        right(.626+wide-.08*lift,.645-.053*tap-.24*lift,v === 'thread' ? 'point':'fist',doing);
        p.head = (.05 + .03*handBeat - .08*lift)*doing;
        p.squash = (v==='wipe' ? .062 : .023)*doing;
        if (v==='rage') {p.lean=.095*wave(t,2.1)*pulse(t,6.8,1.6);p.mouth=-.6*e;}
        if (v==='grimace') {p.wink=pulse(t,5.1,.7);p.mouth=.65*pulse(t,6.1,.7);}
        if (v==='knock') prop('tap-lines',.66,.71,.18,tap);
        else if (v==='tasks') props.forEach((item,i)=> {
          const a=TAU*(t*.44+i/props.length);
          prop(item,.53+.33*Math.sin(a),.01-.085*Math.cos(a),.13,doing);
        });
        else prop(props[0],.527 + (v==='wipe'?wide:0),.658-.29*lift,
          ['code','gomoku','ink'].includes(v)?.32:.22,doing,v==='turn'?1.1*wave(t,.59):.1*handBeat);
        if (v==='unwrap') prop('♥',.55,.49-.14*ramp(t,4.8,6.15),.2,gate(t,4.7,7.6));
        if (v==='corsage') prop(props[1],.67,.35,.14,gate(t,5.3,9.4));
        if (v==='greet') {p.squash+=.075*pulse(t,3.8,.95);prop('coin',.57,.52,.11,pulse(t,6.2,1.1));}
        if (v==='archive') trail('✧',7.1,.21,5,.55,.59,.23,-.12,.10);
        if (v==='thread') prop('🌙',.83,.03,.17,doing);
      }
      break;
    }
    case 'aim':
    case 'music':
    case 'bubbles': {
      const rhythm = wave(t, v === 'brush' ? 3.1 : v === 'cool' ? 1.75 : .87);
      const play = gate(t, 1, 8.9, .72);
      const bx = v === 'violin' ? .42 : v === 'cool' ? .76 : .595;
      const by = v === 'spray' ? .59 : v === 'violin' ? .535 : .416;
      p.head = .067 * wave(t,.64) * play;
      p.blink = ['cool','violin','hum'].includes(v) ? .85*play : pulse(t,4.9,.28);
      p.mouth = v === 'blow' ? .43 * play : .22 * Math.max(0,rhythm) * play;
      right(bx+.065+.024*rhythm,by+.08-.035*rhythm,'fist',play);
      if (v !== 'cool' && v !== 'brush') left(bx-.14,by+.07,'soft',play);
      if (!['blow','hum'].includes(v)) prop(props[0],bx,by,.23,play,.28*rhythm);
      if (v === 'spray') trail('drop',3.3,.21,12,.67,.55,.33,-.12,.085);
      if (v === 'cool') trail('air',2.2,.54,10,.71,.35,-.31,-.16,.15);
      if (v === 'brush') trail('○',3.1,.62,9,.55,.42,.15,-.08,.086);
      if (v === 'blow') trail('○',2,.73,7,.57,.43,.36,-.45,.14);
      if (motion.kind === 'music') trail(v==='violin'?'♫':'♪',2,.7,8,.65,.27,.23,-.39,.145);
      break;
    }
    case 'orbit': {
      const items = props.length;
      p.head = .12*wave(t,.42)*e;
      p.mouth = .28*e;
      right(.73,.48+.055*wave(t,.42),'point');
      for (let i=0;i<items;i++) {
        const angle = TAU*(t*.37+i/items);
        const radius = (.25+.25*ramp(t,1.8,3.4)) * (1-.35*ramp(t,7.6,9.35));
        prop(props[i],.53+radius*Math.sin(angle),.34-.22*Math.cos(angle+i*.4),
          (v==='whale'?.245:.17) * (.84+.16*Math.sin(angle)), e, .35*Math.sin(angle));
      }
      if (v==='garden') prop('🌸',.51,.015,.19,pulse(t,6.4,3.0));
      if (v==='ghost') prop('✧',.79,.37,.11,pulse(t,7.35,1.45));
      break;
    }
    case 'ground':
    case 'weather': {
      const seated = gate(t,1.2,8.35,1.2);
      const swing = wave(t,v==='swing'?.58:v==='ride'?.68:1.1);
      p.squash = (v==='pile'?.22:.16)*seated;
      p.head = .095*seated;
      p.lean = (v==='ride'||v==='swing'?.17:.05)*swing*seated;
      const float = v==='swing'||v==='ride' ? .075*(1+.45*swing)*seated : 0;
      p.rise = float + (v==='pile'?.18*pulse(t,7.2,.84):0);
      left(.39-.048*swing,v==='swing'?.55:.79+.02*swing,'soft',seated);
      right(.65+.073*swing,v==='swing'?.55:.79-.027*swing,'fist',seated);
      if (v==='swing') prop('swing',.52,.81,.67,seated,.17*swing);
      else if (v==='pile') {
        for (let i=0;i<14;i++) {
          const age=(t*.43+i*.27)%1;
          prop('leaf',.18+(i%6)*.14+.063*wave(age,.6,i),-.14+age*.93,.09+(i%3)*.024,
            Math.sin(Math.PI*age)*e,.9*wave(age,.8,i));
        }
        prop('leaves',.52,.92,.5,gate(t,3,7.35,.9));
      } else {
        const x=.52+(v==='roll'?.22*swing:v==='ride'?.044*swing:0);
        const y=v==='spin'?.955:v==='decorate'?.765:.837;
        prop(props[0],x,y,v==='decorate'?.41:v==='ride'?.43:.26,e,v==='spin'?t*TAU*.78:.11*swing);
        if (v==='build') trail('❄',3.2,.55,9,.64,.49,.26,-.32,.09);
        if (v==='decorate') {
          for (let i=0;i<4;i++) prop(['🔴','🟡','🔵','🟣'][i],.45+.043*i,.75+.045*(i%2),.063,
            gate(t,2.25+i*.82,9.6));
          prop('★',.516,.61,.11,gate(t,6.1,9.6));
        }
      }
      break;
    }
    case 'tail': {
      left(.62,.6,'fist'); right(.43,.62,'fist');
      p.mouth = -.53*e;
      p.blink = pulse(t,4,.22);
      prop('fluke',.85+.05*wave(t,.65),.906-.10*Math.abs(wave(t,.81)),.27,e, .38*wave(t,.81));
      trail('·',2.5,.72,8,.83,.91,.14,-.04,.083);
      break;
    }
    case 'release':
    case 'balloon':
    case 'magic':
    case 'spark': {
      const lifted = ramp(t,2.35,4.75);
      const released = ramp(t,5.05,8.92);
      const toss = gate(t,1,8.4);
      p.head = -.075 * lifted * e;
      p.mouth = v==='pop' ? .5*pulse(t,4.65,.62) : .18*toss;
      p.rise = v==='pop' ? .06*pulse(t,4.65,.6) : 0;
      left(.40,.61-.10*lifted,'soft',toss);
      right(.61+.10*lifted,.61-.23*lifted,v==='flower'?'open':'fist',toss);
      if (v === 'tether') {
        const x=.62+.2*lifted+.1*wave(t,.33)*lifted, y=.62-.69*lifted;
        prop('kite',x,y,.22,e,.27*wave(t,.43));
        prop('tether',x,y,.1,e);
      } else if (v==='river'||v==='sky') {
        prop(props[0],.53+.35*released,v==='sky'?.65-.79*released:.65+.24*released,.23*(1-.34*released),e);
        if (v==='river') prop('ripples',.61,.92,.42,gate(t,5,9.7));
        else trail('✧',5.4,.4,7,.64,.26,.2,-.28,.08);
      } else if (v==='pop') {
        prop('🎈',.63,.34,.1+.22*ramp(t,1.7,4.2),gate(t,1.2,4.65,.32));
        prop('✷',.64,.34,.27,pulse(t,4.65,.4));
        prop('🎈',.64+.18*released,.38-.49*released,.2,gate(t,5.2,9.6));
      } else if (v==='fireworks') {
        prop('sparkler',.69,.4-.14*lifted,.21,toss,.42*wave(t,.8));
        for(let i=0;i<12;i++) {
          const a=TAU*i/12;
          const power=pulse(t,3.4+(i%3)*1.85,.95);
          prop('✦',.67+Math.cos(a)*(.16+.05*power),.13+Math.sin(a)*(.21+.05*power),.08,power,a);
        }
      } else {
        prop(props[0],.59,.58-.18*lifted,.24,v==='dove'?toss:gate(t,3.1,9.55),
          v==='card'?wave(t,.65):.12*wave(t,.55));
        if (v==='dove') prop(props[1],.58+.29*released,.56-.69*released,.23,gate(t,4.7,9.65));
        trail('✧',3.5,.34,8,.61,.44,.23,-.31,.091);
      }
      break;
    }
    case 'juggle': {
      const pace = v==='kick'?1.54:.87;
      const rhythm = wave(t,pace);
      left(.32,.62+.05*rhythm,'open'); right(.72,.62-.05*rhythm,'open');
      p.head=.055*rhythm*e;
      if (v==='kick') {
        p.stepR=.13*Math.max(0,rhythm)*e; p.lean=-.07*rhythm*e;
        const phase = (t*.77)%1;
        prop('shuttle',.66+.09*wave(t,.77),.87-1.23*phase*(1-phase),.16,e,.6*rhythm);
      } else {
        for(let i=0;i<3;i++){
          const phase=(t*.53+i/3)%1, dir=i%2===0?1:-1;
          prop(['ball-red','ball-gold','ball-blue'][i],.52+dir*.36*(phase-.5),.56-2.1*phase*(1-phase),.113,e);
        }
      }
      break;
    }
    default:
      throw new Error(`Unrecognized motion kind: ${motion.kind}`);
  }
  p.rise += .0045 * e * wave(t,.61);
  if (p.blink < .08) p.blink += .78 * (pulse(t,1.38,.17)+pulse(t,8.83,.19));
  return p;
}
