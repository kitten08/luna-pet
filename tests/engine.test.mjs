import test from 'node:test';import assert from 'node:assert/strict';import {PetEngine} from '../src/engine.js';
globalThis.devicePixelRatio=1;globalThis.ResizeObserver=class{observe(){}disconnect(){}};globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
function engine(){const canvas=new EventTarget();canvas.getContext=()=>({});canvas.getBoundingClientRect=()=>({left:0,top:0,width:600,height:600});canvas.setPointerCapture=()=>{};return new PetEngine(canvas,{reduced:false});}
test('throws stay inside the visible viewport and settle on the floor',()=>{const p=engine();p.x=180;p.y=-40;p.vx=1000;p.vy=-300;for(let i=0;i<1000;i++){p.physics(1/120);assert.ok(Math.abs(p.x)<=168+1e-6);assert.ok(p.y<=0);assert.ok(p.y>=-72-1e-6);}assert.equal(p.y,0);assert.equal(p.vy,0);assert.ok(Math.abs(p.vx)<1);p.destroy();});
test('invalid or not-yet-loaded outfits do not replace the active outfit',()=>{const p=engine();assert.equal(p.setOutfit('lolita'),false);assert.equal(p.setOutfit('invalid'),false);assert.equal(p.outfit.id,'original');p.images.set('lolita',{});assert.equal(p.setOutfit('lolita'),true);assert.equal(p.outfit.id,'lolita');p.destroy();});
test('pending and incompatible outfit actions do not start playback', () => {
 const pet = engine();
 assert.equal(pet.play('sleep-start'), false);
 assert.equal(pet.wake(), false);
 pet.images.set('jk', {});
 assert.equal(pet.setOutfit('jk'), true);
 assert.equal(pet.play('new-01'), false);
 assert.equal(pet.action.id, null);
 pet.destroy();
});
