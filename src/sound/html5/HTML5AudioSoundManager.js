var Class = require('../../utils/Class');
var BaseSoundManager = require('../BaseSoundManager');
var HTML5AudioSound = require('./HTML5AudioSound');
var SoundValueEvent = require('../SoundValueEvent');
var HTML5AudioSoundManager = new Class({
    Extends: BaseSoundManager,
    initialize: function HTML5AudioSoundManager(game) {
        /**
         * Flag indicating whether if there are no idle instances of HTML5 Audio tag,
         * for any particular sound, if one of the used tags should be stopped and used
         * for succeeding playback or if succeeding Phaser.Sound.HTML5AudioSound#play
         * call should be ignored.
         *
         * @property {boolean} override
         * @default true
         */
        this.override = true;
        /**
         * Value representing time difference in seconds between calling
         * play method on an audio tag and when it actually starts playing.
         * It is used to achieve more accurate delayed sound playback.
         *
         * You might need to tweak this value to get the desired results
         * since audio play delay varies depending on the browser/platform.
         *
         * @property {number} audioPlayDelay
         * @default 0.1
         */
        this.audioPlayDelay = 0.1;
        /**
         * A value by which we should offset the loop end marker of the looping sound to compensate
         * for lag, caused by changing audio tag position, in order to achieve gapless looping.
         *
         * You might need to tweak this value to get the desired results
         * since loop lag varies depending on the browser/platform.
         *
         * @property {number} loopEndOffset
         * @default 0.05
         */
        this.loopEndOffset = 0.05;
        /**
         * An array for keeping track of all the sounds
         * that were paused when game lost focus.
         *
         * @private
         * @property {Phaser.Sound.HTML5AudioSound[]} onBlurPausedSounds
         * @default []
         */
        this.onBlurPausedSounds = [];
        /**
         * Property that actually holds the value of global mute
         * for HTML5 Audio sound manager implementation.
         *
         * @private
         * @property {boolean} _mute
         * @default false
         */
        this._mute = false;
        /**
         * Property that actually holds the value of global volume
         * for HTML5 Audio sound manager implementation.
         *
         * @private
         * @property {boolean} _volume
         * @default 1
         */
        this._volume = 1;
        BaseSoundManager.call(this, game);
    },
    add: function (key, config) {
        var sound = new HTML5AudioSound(this, key, config);
        this.sounds.push(sound);
        return sound;
    },
    onBlur: function () {
        this.forEachActiveSound(function (sound) {
            if (sound.isPlaying) {
                this.onBlurPausedSounds.push(sound);
                sound.pause();
            }
        });
    },
    onFocus: function () {
        this.onBlurPausedSounds.forEach(function (sound) {
            sound.resume();
        });
        this.onBlurPausedSounds.length = 0;
    },
    destroy: function () {
        BaseSoundManager.prototype.destroy.call(this);
        this.onBlurPausedSounds.length = 0;
        this.onBlurPausedSounds = null;
    }
});
/**
 * Global mute setting.
 *
 * @name Phaser.Sound.HTML5AudioSoundManager#mute
 * @property {boolean} mute
 */
Object.defineProperty(HTML5AudioSoundManager.prototype, 'mute', {
    get: function () {
        return this._mute;
    },
    set: function (value) {
        this._mute = value;
        this.forEachActiveSound(function (sound) {
            sound.setMute();
        });
        this.events.dispatch(new SoundValueEvent(this, 'SOUND_MUTE', value));
    }
});
/**
 * Global volume setting.
 *
 * @name Phaser.Sound.HTML5AudioSoundManager#volume
 * @property {number} volume
 */
Object.defineProperty(HTML5AudioSoundManager.prototype, 'volume', {
    get: function () {
        return this._volume;
    },
    set: function (value) {
        this._volume = value;
        this.forEachActiveSound(function (sound) {
            sound.setVolume();
        });
        this.events.dispatch(new SoundValueEvent(this, 'SOUND_VOLUME', value));
    }
});
module.exports = HTML5AudioSoundManager;
