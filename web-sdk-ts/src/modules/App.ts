import Client from '@livedigital/client';
import type PeerTrack from '@livedigital/client/dist/engine/media/tracks/PeerTrack';
import type ClientPeer from '@livedigital/client/dist/engine/Peer';
import type { Track } from '@livedigital/client/dist/types/common';

import Peer from './Peer';
import { joinParams } from '../config';

import {
  PeerCallbacks,
} from '../types';

class App {
  private rootEl: HTMLElement | null = null;

  private readonly client: Client | null;

  private peers: Map<string, Peer> = new Map();

  private micTrack: Track | null = null;

  private cameraTrack: Track | null = null;

  private ui: Record<string, HTMLButtonElement> = {};

  private isJoining = false;

  private callbacks: PeerCallbacks = {
    onTrackStart: (track: PeerTrack) => { this.onPeerTrackStart(track); },
    onTrackEnd: (track: PeerTrack) => { this.onPeerTrackEnd(track); },
  };

  constructor() {
    this.client = new Client({
      network: {
        loadbalancer: {
          baseURL: 'https://lb.livedigital.space/v1',
        },
      },
      logLevel: 7,
      onLogMessage: (msg: string, meta: Record<string, unknown> = {}) => {
        console.log(msg, meta);
      },
    });
    this.listenChannelEvents();
  }

  init(rootElId: string) {
    this.rootEl = document.querySelector(`#${rootElId}`);
    this.initUI();
    this.initMediaDevices();
  }

  private listenChannelEvents(): void {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    this.client.observer.on('peer-joined', (peer: ClientPeer) => {
      if (peer.role !== 'host' || this.peers.has(peer.id)) {
        return;
      }

      const newPeer = new Peer(peer, this.callbacks);
      this.peers.set(peer.id, newPeer);
    });

    this.client.observer.on('peer-left', (peerId: string) => {
      if (peerId) {
        this.peers.delete(peerId);
        const videoEl = this.rootEl?.querySelector('#remote-video') as HTMLVideoElement;
        (videoEl.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        videoEl.srcObject = null;
      }
    });
  }

  private async join() {
    if (!this.client) {
      throw new Error('Client not intialized');
    }

    const {
      appId, channelId, sdkSecret
    } = joinParams;

    try {
      await this.client.join({
        appId,
        channelId,
        sdkSecret,
        uid: Date.now().toString(),
        appData: {
          isAudioStreamingAllowed: true,
          isVideoStreamingAllowed: true,
          isModerator: true,
          isOutOfScreen: false,
        },
        role: 'host',
      });
    } catch (error: unknown) {
      console.log('JOIN ERROR', error);
    }
  }

  private async joinRoom() {
    this.isJoining = true;
    this.updateUI();
    try {
      await this.join();
      await this.loadPeers();
      await this.enableAudio();
      await this.enableVideo();
    } catch (error) {
      console.error('Failed to join', error);
    }

    this.isJoining = false;
    this.updateUI();
  }

  private async loadPeers() {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    await this.client.loadPeers('host');
    const { peers } = this.client;

    peers.forEach((peer) => {
      if (this.peers.has(peer.id) || peer.isMe) {
        return;
      }

      const newPeer = new Peer(peer, this.callbacks);
      this.peers.set(peer.id, newPeer);
    });
  }

  private async initMediaDevices() {
    try {
      const videoEl = this.rootEl?.querySelector<HTMLVideoElement>('#me-video');
      if (!videoEl || !this.client) {
        throw new Error('App not initialized');
      }

      const devices = await this.client.detectDevices();
      console.log('Available devices', devices);
      if (devices.video.length) {
        this.cameraTrack = await this.client.createCameraVideoTrack({ video: { deviceId: 'default' } });
      }

      if (devices.audio.length) {
        this.micTrack = await this.client.createMicrophoneAudioTrack({ audio: { deviceId: 'default' } });
      }

      if (this.cameraTrack) {
        const stream = new MediaStream([this.cameraTrack.mediaStreamTrack]);
        videoEl.srcObject = stream;
      }
    } catch (error) {
      console.error('Error getting meida devices', error);
    }
  }

  private async enableAudio() {
    this.ui.micToggle.disabled = true;
    try {
      await (this.micTrack?.isPublished ? this.micTrack.resume() : await this.micTrack?.publish());
    } catch (error) {
      console.error('Mic error', error);
    }
    this.ui.micToggle.disabled = false;
  }

  private async disableAudio() {
    this.ui.micToggle.disabled = true;
    try {
      await (this.micTrack?.isPublished ? this.micTrack.pause() : await this.micTrack?.unpublish());
    } catch (error) {
      console.error('Mic error', error);
    }
    this.ui.micToggle.disabled = true;
  }

  private async enableVideo() {
    this.ui.cameraToggle.disabled = true;
    try {
      await (this.cameraTrack?.isPublished ? this.cameraTrack.resume() : await this.cameraTrack?.publish());
    } catch (error) {
      console.error('Camera error', error);
    }
    this.ui.cameraToggle.disabled = false;
  }

  private async disableVideo() {
    this.ui.cameraToggle.disabled = true;
    try {
      await (this.cameraTrack?.isPublished ? this.cameraTrack.pause() : await this.cameraTrack?.unpublish());
    } catch (error) {
      console.error('Camera error', error);
    }
    this.ui.cameraToggle.disabled = false;
  }

  private async onPeerTrackStart(track: PeerTrack) {
    // for simplicity we have only one video slot for remote participants
    const videoEl = this.rootEl?.querySelector('#remote-video') as HTMLVideoElement;
    if (videoEl) {
      const stream = (videoEl.srcObject || new MediaStream()) as MediaStream;
      videoEl.srcObject = stream;
      await track.unmute();
      stream.addTrack(track.mediaStreamTrack);
    }
  }

  private onPeerTrackEnd(track: PeerTrack) {
    console.log('Track end', track);
  }

  private async toggleMic() {
    if (!this.micTrack) {
      return;
    }

    await (this.micTrack.isPaused ? this.enableAudio() : this.disableAudio());
    this.updateUI();
  }

  private async toggleCamera() {
    if (!this.cameraTrack) {
      return;
    }

    await (this.cameraTrack.isPaused ? this.enableVideo() : this.disableVideo());
    this.updateUI();
  }

  private updateUI() {
    const isJoined = Boolean(this.client?.peers.length);
    this.ui.joinButton.disabled = isJoined || this.isJoining;
    this.ui.joinButton.innerText = this.isJoining ? 'Joining...' : 'Join';
    this.ui.micToggle.disabled = Boolean(!isJoined);
    this.ui.cameraToggle.disabled = Boolean(!isJoined);
    this.ui.micToggle.innerText = this.micTrack?.isPaused ? 'Microphone On' : 'Microphone Off';
    this.ui.cameraToggle.innerText = this.cameraTrack?.isPaused ? 'Camera On' : 'Camera Off';
  }

  private initUI() {
    if (!this.rootEl) {
      throw new Error('App root tag not found');
    }

    this.ui = {
      joinButton: this.rootEl.querySelector('#join-room') as HTMLButtonElement,
      micToggle: this.rootEl.querySelector('#mic-toggle') as HTMLButtonElement,
      cameraToggle: this.rootEl.querySelector('#camera-toggle') as HTMLButtonElement,
    };

    this.ui.joinButton.onclick = () => { this.joinRoom(); };
    this.ui.micToggle.onclick = () => { this.toggleMic(); };
    this.ui.cameraToggle.onclick = () => { this.toggleCamera(); };

    this.updateUI();
  }
}

export default new App();
