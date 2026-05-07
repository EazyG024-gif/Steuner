'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { Button } from './ui/button';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(Array.from(raw).map((c) => c.charCodeAt(0)));
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7–23

export function NotificationPrompt() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [reminderHour, setReminderHour] = useState(20);
  const [savedHour, setSavedHour] = useState(20);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
    setSupported(true);
    setPermission(Notification.permission);
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub));
    });
  }, []);

  async function enable() {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return;

      const reg = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error('VAPID key missing');

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sub.toJSON(), reminder_hour: reminderHour }),
      });

      setSavedHour(reminderHour);
      setSubscribed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }

  async function updateTime() {
    setLoading(true);
    try {
      await fetch('/api/push/update-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_hour: reminderHour }),
      });
      setSavedHour(reminderHour);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return <p className="text-xs text-muted-foreground">v3 – niet ondersteund in deze browser</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950/40 shrink-0">
          {subscribed ? (
            <Bell size={16} className="text-primary" />
          ) : (
            <BellOff size={16} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Dagelijkse herinnering</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {permission === 'denied'
              ? 'Geblokkeerd in browserinstellingen'
              : subscribed
              ? `Ingeschakeld — elke dag om ${savedHour}:00`
              : 'Ontvang een seintje voor je check-in'}
          </p>
        </div>
        {permission !== 'denied' && (
          <Button
            size="sm"
            variant={subscribed ? 'outline' : 'default'}
            onClick={subscribed ? disable : enable}
            disabled={loading}
            className="shrink-0"
          >
            {subscribed ? 'Uit' : 'Aan'}
          </Button>
        )}
      </div>

      {/* Time picker — always shown when push is supported */}
      {permission !== 'denied' && (
        <div className="flex items-center gap-3 px-3">
          <span className="text-xs text-muted-foreground">Tijdstip</span>
          <select
            value={reminderHour}
            onChange={(e) => setReminderHour(Number(e.target.value))}
            className="flex-1 text-sm bg-muted border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
          {subscribed && reminderHour !== savedHour && (
            <Button
              size="sm"
              onClick={updateTime}
              disabled={loading}
              className="shrink-0 flex items-center gap-1.5"
            >
              {saved ? <Check size={13} /> : null}
              Opslaan
            </Button>
          )}
          {saved && reminderHour === savedHour && (
            <span className="text-xs text-emerald-600 flex items-center gap-1">
              <Check size={12} /> Opgeslagen
            </span>
          )}
        </div>
      )}
    </div>
  );
}
