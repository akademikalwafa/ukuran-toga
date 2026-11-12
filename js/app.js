// ============================================================
// TOGA CERIA — SPA (GAS-PRO-API + GAS-INSTANT-UX)
// Navigasi 0ms · stale-while-revalidate · optimistic UI · retry otomatis
// ============================================================
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
const jget = (k, d, st = localStorage) => { try { return JSON.parse(st.getItem(k)) ?? d; } catch { return d; } };
const jset = (k, v, st = localStorage) => { try { st.setItem(k, JSON.stringify(v)); } catch {} };
const fmt = ms => ms ? new Date(ms).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'long', timeStyle: 'short' }) + ' WIB' : '-';
const gid = v => { v = String(v || '').trim(); const m = v.match(/\/d\/([\w-]{20,})/) || v.match(/[?&]id=([\w-]{20,})/) || (/^[\w-]{25,}$/.test(v) ? [0, v] : null); return m ? m[1] : ''; };
const gimg = v => { const i = gid(v); return i ? 'https://drive.google.com/thumbnail?id=' + i + '&sz=w1600' : /^https?:/.test(String(v || '').trim()) ? v.trim() : ''; };
const gimg2 = v => { const i = gid(v); return i ? 'https://lh3.googleusercontent.com/d/' + i : ''; };
const gtag = (v, alt) => { const g = gimg(v); return g ? `<img class="gimg" src="${esc(g)}" data-f="${esc(gimg2(v))}" alt="${alt}" onerror="if(this.dataset.f&&!this.dataset.t){this.dataset.t=1;this.src=this.dataset.f}else{this.outerHTML='<small>Gambar panduan belum bisa dimuat. Pastikan file Drive dibagikan: Siapa saja yang memiliki link.</small>'}">` : ''; };
const tabelUk = t => t && t.length ? `<div class="tw"><table class="uk"><tr><th>Ukuran</th><th>LD</th><th>PJ</th><th>PJT</th></tr>${t.map(r => `<tr><td><b>${esc(r.l)}</b></td><td>${esc(r.ld)}</td><td>${esc(r.pj)}</td><td>${esc(r.pjt)}</td></tr>`).join('')}</table></div><small>LD = Lingkar Dada · PJ = Panjang Jubah · PJT = Panjang Jubah Tangan (satuan cm)</small>` : '';
const S = { pub: jget('tc_pub', null), st: null, v: 'home' };
const A = { token: localStorage.getItem('tc_tk') || '', d: null, ps: new Set(), pend: new Map(), act: Date.now(),
  mf: { q: '', prodi: '', ang: '', kelas: '', st: '', pg: 0 }, df: { tab: 'sudah', q: '', prodi: '', uk: '', pg: 0 } };

let tt; function toast(m, err) { const t = $('#toast'); t.textContent = m; t.className = 'show' + (err ? ' err' : ''); clearTimeout(tt); tt = setTimeout(() => t.className = '', 3200); }
const wait = ms => new Promise(r => setTimeout(r, ms));
async function api(action, data = {}, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const j = await (await fetch(GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, data, token: A.token }) })).json();
      if (j.busy && i < tries - 1) { await wait(900 * (i + 1)); continue; }
      return j;
    } catch (e) { if (i === tries - 1) return { success: false, message: 'Koneksi bermasalah. Periksa internet lalu coba lagi.' }; await wait(700); }
  }
}
function modal(h) { $('#modal').innerHTML = '<div class="md">' + h + '</div>'; $('#modal').classList.add('on'); }
const closeModal = () => $('#modal').classList.remove('on');

// ===================== MAHASISWA =====================
const isOpen = p => p && p.open && (!p.batas || Date.now() <= p.batas);
const waBtn = p => p && p.wa ? `<a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/62${esc(p.wa.replace(/\D/g, '').replace(/^0/, ''))}">💬 Hubungi Panitia (WhatsApp)</a>` : '';
const info = (ic, t, x) => `<div class="card"><h3>${ic} ${t}</h3><p>${x ? nl(x) : '<small>Belum ada informasi.</small>'}</p></div>`;

function go(v) {
  S.v = v; $$('#S .v').forEach(e => e.classList.toggle('on', e.id === 'v-' + v));
  $$('#bn button').forEach(b => b.classList.toggle('on', b.dataset.n === v)); scrollTo(0, 0);
}
async function loadPub() {
  try { const r = await (await fetch(GAS_URL + '?action=public')).json(); if (r.success) { S.pub = r.data; jset('tc_pub', r.data); renderHome(); } }
  catch (e) { if (!S.pub) toast('Gagal memuat informasi. Muat ulang halaman.', 1); }
}
function renderHome() {
  const p = S.pub, el = $('#v-home');
  if (!p) { el.innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div>'; return; }
  const o = isOpen(p);
  el.innerHTML = `<div class="hero"><span class="pill ${o ? '' : 'no'}">● Portal: ${o ? 'DIBUKA' : 'DITUTUP'}</span>
    <h1>Konfirmasi Ukuran Baju Toga Wisuda ${esc(p.tahun)} 🎓</h1><p>Pastikan ukuran toga & data wisudawan Anda terisi dengan benar.</p>
    ${p.batas ? `<div class="deadline">⏰ Batas akhir: ${fmt(p.batas)}</div>` : ''}</div>
    <div class="card"><b>Sudah siap mengonfirmasi?</b><p><small>Hanya butuh 2 menit dengan NIM Anda.</small></p><button class="btn" data-a="login">Masuk dengan NIM →</button></div>
    ${info('📅', 'Informasi Wisuda', p.wisuda)}${info('👘', 'Gladi & Pengambilan Toga', p.gladi)}${info('💳', 'Pembayaran Wisuda', p.bayar)}
    <div class="card" id="panduan"><h3>📏 Panduan Ukuran Baju Toga</h3>${gtag(p.gambar, 'Panduan ukuran toga')}
    ${tabelUk(p.tabel) || `<div class="chips">${p.ukuran.map(u => `<div class="chip"><b>${esc(u.l)}</b><small>${esc(u.k)}</small></div>`).join('')}</div>`}</div>
    ${waBtn(p)}<div class="foot">© Panitia Wisuda · <a href="#/admin">Login Panitia</a></div>`;
}
function openLogin() {
  modal(`<div class="ic">🎓</div><h2>Masuk dengan NIM</h2><form id="nf"><label style="text-align:left">NIM Anda<input name="nim" inputmode="numeric" autocomplete="off" value="${esc(localStorage.getItem('tc_nim') || '')}" required></label>
  <button class="btn">Masuk</button></form><button class="btn ghost" data-a="close">Batal</button>`);
  setTimeout(() => $('#nf input')?.focus(), 50);
}
async function doLogin(nim) {
  nim = nim.trim(); if (!nim) return; localStorage.setItem('tc_nim', nim); closeModal();
  const c = jget('tc_s_' + nim);
  if (c) applySt(c); else { go('form'); $('#v-form').innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div>'; }
  const r = await api('studentLogin', { nim });
  if (!r.success) { toast(r.message, 1); go('home'); return; }
  r.state === 'terkirim' || r.state === 'form' ? jset('tc_s_' + nim, r) : localStorage.removeItem('tc_s_' + nim);
  applySt(r);
}
function applySt(r) {
  S.st = r;
  if (r.state === 'ditolak') { go('home'); modal(`<div class="ic">🚫</div><h2>Anda belum terdaftar sebagai peserta wisuda</h2><p>Hubungi admin / panitia wisuda.</p>${waBtn(S.pub)}<button class="btn" data-a="close">Mengerti</button>`); }
  else if (r.state === 'tutup') { go('home'); modal(`<div class="ic">🔒</div><h2>Portal Ditutup</h2><p>${nl(r.pesan)}</p>${waBtn(S.pub)}<button class="btn" data-a="close">Tutup</button>`); }
  else if (r.state === 'form') { renderForm(); go('form'); }
  else if (r.state === 'terkirim') { renderStatus(); go('status'); }
}
function renderForm() {
  const id = S.st.id, p = S.pub || { ukuran: [] }, d = jget('tc_d_' + id.nim, {});
  $('#v-form').innerHTML = `<div class="card"><span class="pill">✔ Data Terverifikasi Yudisium</span><p><small>NAMA MAHASISWA</small></p><h2>${esc(id.nama)}</h2>
    <div class="g2"><div><small>NIM</small><br><b>${esc(id.nim)}</b></div><div><small>Prodi</small><br><b>${esc(id.prodi)}</b></div></div><small>Angkatan ${esc(id.angkatan)} · Kelas ${esc(id.kelas)}</small></div>
  <form id="f" class="card" autocomplete="off"><h3>1. Pilih Ukuran Baju Toga <i class="req">Wajib</i></h3>
    <div class="sz">${p.ukuran.map(u => `<label class="chip"><input type="radio" name="u" value="${esc(u.l)}" ${d.u === u.l ? 'checked' : ''}><b>${esc(u.l)}</b><small>${esc(u.k)}</small></label>`).join('')}</div>
    ${p.gambar || (p.tabel || []).length ? `<details><summary>Buka panduan ukuran</summary>${tabelUk(p.tabel)}${gtag(p.gambar, 'Panduan ukuran')}</details>` : ''}
    <h3>2. Data Keluarga & Domisili</h3>
    <label>Nama Lengkap Ayah *<input name="ayah" value="${esc(d.ayah)}"></label><label>Nama Lengkap Ibu *<input name="ibu" value="${esc(d.ibu)}"></label>
    <label>Kota Asal / Domisili *<input name="kota" value="${esc(d.kota)}"></label>
    <h3>3. Kontak WhatsApp</h3><div class="note">⚠️ Wajib diawali angka <b>0</b> (contoh: 0812…). Jangan pakai +62 atau 62. Dipakai panitia untuk undangan wisuda & barcode snack/makan.</div>
    <label>No. WhatsApp Aktif *<input name="wa" inputmode="numeric" value="${esc(d.wa)}"><small id="wah"></small></label>
    <label class="ck"><input type="checkbox" name="ok" ${d.ok ? 'checked' : ''}> Saya menyatakan data di atas benar & siap dicetak oleh panitia.</label>
    <button class="btn big" id="sb" disabled>Kirim Konfirmasi Toga 🎓</button></form>`;
  chk();
}
const fd = () => { const f = $('#f'); if (!f) return {}; const o = Object.fromEntries(new FormData(f)); o.ok = !!o.ok; return o; };
const waErr = w => !w ? '' : /^(\+|62)/.test(w) ? 'Jangan pakai +62 / 62. Awali dengan 0.' : !/^\d+$/.test(w) ? 'Hanya boleh angka.' : !/^0\d{8,14}$/.test(w) ? 'Nomor belum valid (9–15 digit, diawali 0).' : '';
function chk(save) {
  const o = fd(), w = (o.wa || '').trim(), e = waErr(w), h = $('#wah'); if (!h) return;
  h.textContent = e || (w ? '✔ Format benar' : ''); h.className = e ? 'er' : 'okc';
  $('#sb').disabled = !(o.u && ['ayah', 'ibu', 'kota', 'wa'].every(k => (o[k] || '').trim()) && !e && o.ok);
  if (save) jset('tc_d_' + S.st.id.nim, { u: o.u, ayah: o.ayah, ibu: o.ibu, kota: o.kota, wa: o.wa, ok: o.ok });
}
async function submit() {
  if ($('#sb').disabled) return;
  const o = fd(), prev = S.st, id = prev.id, rec = [id.nim, id.nama, id.prodi, o.u, o.ayah.trim(), o.ibu.trim(), o.kota.trim(), o.wa.trim(), Date.now(), 'Terkirim'];
  applySt({ success: true, state: 'terkirim', id, data: rec, open: true, pending: 1 });          // optimistic: pindah halaman instan
  const r = await api('studentSubmit', { nim: id.nim, ukuran: o.u, ayah: rec[4], ibu: rec[5], kota: rec[6], wa: rec[7] });
  if (r.success) { const f = { success: true, state: 'terkirim', id, data: r.data, open: true }; localStorage.removeItem('tc_d_' + id.nim); jset('tc_s_' + id.nim, f); applySt(f); toast('Konfirmasi berhasil terkirim 🎉'); }
  else { toast(r.message, 1); /sudah terkirim/.test(r.message) ? doLogin(id.nim) : applySt(prev); }  // rollback
}
function renderStatus() {
  const r = S.st, k = r.data, id = r.id, p = S.pub || {}, u = (p.ukuran || []).find(x => x.l === k[3]);
  const can = r.open !== false && (!p.batas || Date.now() <= p.batas) && !r.pending;
  $('#v-status').innerHTML = `<div class="hero ok2"><h1>${r.pending ? 'Menyimpan…' : 'Konfirmasi Berhasil! 🎓'}</h1>
    <p>Terima kasih, <b>${esc(id.nama)}</b>. Data Anda ${r.pending ? 'sedang disimpan ke sistem.' : 'sudah tersimpan di sistem panitia.'}</p><div class="deadline">Terkirim: ${fmt(k[8])}</div></div>
  <div class="card"><h3>Data Pesanan & Profil</h3>
    <div class="row"><span>NIM</span><b>${esc(id.nim)}</b></div><div class="row"><span>Prodi</span><b>${esc(id.prodi)}</b></div>
    <div class="row"><span>Ukuran Toga</span><b class="big">${esc(k[3])} <small>${u ? esc(u.k) : ''}</small></b></div>
    <div class="row"><span>Nama Ayah</span><b>${esc(k[4])}</b></div><div class="row"><span>Nama Ibu</span><b>${esc(k[5])}</b></div>
    <div class="row"><span>Kota Asal</span><b>${esc(k[6])}</b></div><div class="row"><span>No. WhatsApp</span><b>${esc(k[7])}</b></div></div>
  <div class="note">🔒 Form terkunci agar tidak terjadi data ganda.${can ? ' Jika ukuran/data salah, batalkan lalu isi ulang selama portal masih dibuka.' : ''}</div>
  ${can ? '<button class="btn red" data-a="cancel">Batalkan Konfirmasi & Isi Ulang</button>' : ''}<button class="btn ghost" data-a="home">Kembali ke Beranda</button>${waBtn(p)}`;
}
async function cancelKonf() {
  if (!confirm('Batalkan konfirmasi dan isi ulang?')) return;
  const prev = S.st, k = prev.data, id = prev.id;
  jset('tc_d_' + id.nim, { u: k[3], ayah: k[4], ibu: k[5], kota: k[6], wa: k[7], ok: false });
  const f = { success: true, state: 'form', id }; applySt(f);                                  // optimistic
  const r = await api('studentCancel', { nim: id.nim });
  if (r.success) jset('tc_s_' + id.nim, f); else { toast(r.message, 1); applySt(prev); }
}
function nav(n) {
  if (n === 'home' || n === 'guide') { go('home'); if (n === 'guide') $('#panduan')?.scrollIntoView(); return; }
  if (S.st && S.st.state === 'form' && n === 'form') return go('form');
  if (S.st && S.st.state === 'terkirim' && (n === 'status' || n === 'form')) return go('status');
  openLogin();
}

// ===================== ADMIN =====================
function route() {
  const ad = location.hash.startsWith('#/admin'); $('#S').hidden = ad; $('#A').hidden = !ad; document.body.classList.toggle('adm', ad);
  if (ad) { if (A.token) { $('#a-login').hidden = true; $('#a-app').hidden = false; aboot(); } else { $('#a-login').hidden = false; $('#a-app').hidden = true; } }
}
function alogout(expired) {
  A.token = ''; A.d = null; localStorage.removeItem('tc_tk'); sessionStorage.removeItem('tc_ad');
  $('#a-login').hidden = false; $('#a-app').hidden = true; if (expired) toast('Sesi berakhir, silakan login ulang.', 1);
}
async function aboot(force) {
  const c = !force && jget('tc_ad', null, sessionStorage); if (c) { A.d = c; arender(); }
  const r = await api('adminBootstrap', { force: !!force });
  if (r.auth) return alogout(true); if (!r.success) return toast(r.message, 1);
  A.d = r; jset('tc_ad', r, sessionStorage); arender(!c || force); if (force) toast('Data master disinkronkan ✔');
}
function arender(cfgToo = true) { A.ps = new Set(A.d.pst); renderDash(); renderMhs(); if (cfgToo) renderCfg(); }
function dv() {
  const act = new Map(); A.d.knf.forEach(r => { if (r[9] === 'Terkirim') act.set(r[0], r); });
  const ms = A.d.mhs.filter(m => A.ps.has(m[0])); return { act, ms, done: ms.filter(m => act.has(m[0])) };
}
const uniq = (i) => [...new Set(A.d.mhs.map(m => m[i]).filter(Boolean))].sort();
const opts = (arr, ph, v) => `<option value="">${ph}</option>` + arr.map(x => `<option ${x === v ? 'selected' : ''}>${esc(x)}</option>`).join('');

function renderDash() {
  if (!A.d) return;
  const { act, ms, done } = dv(), n = ms.length, s = done.length, pct = n ? Math.round(s / n * 100) : 0, prodi = {}, uk = {}, f = A.df;
  ms.forEach(m => { const o = prodi[m[2]] ??= { t: 0, s: 0 }; o.t++; if (act.has(m[0])) o.s++; });
  done.forEach(m => { const k = act.get(m[0])[3]; uk[k] = (uk[k] || 0) + 1; });
  const sizes = JSON.parse(A.d.cfg.ukuran).map(x => x.l), pr = [...new Set(ms.map(m => m[2]))].sort();
  $('#a-dash').innerHTML = `<h2>Dashboard & Rekapitulasi</h2>
  <div class="kp"><div class="card"><small>TOTAL YUDISIUM (DICENTANG)</small><b>${n}</b></div><div class="card"><small>SUDAH MENGISI</small><b style="color:var(--ok)">${s}</b><small>${pct}%</small></div>
  <div class="card"><small>BELUM MENGISI</small><b style="color:var(--wn)">${n - s}</b><small>${100 - pct}% tersisa</small></div></div>
  <div class="two" style="margin-top:12px"><div class="card"><h3>Rekap per Program Studi</h3>${Object.keys(prodi).sort().map(k => { const o = prodi[k], p = Math.round(o.s / o.t * 100); return `<div style="margin:10px 0"><div class="row" style="border:0;padding:0"><span>${esc(k)}</span><b>${o.s} / ${o.t}</b></div><div class="bar"><i style="width:${p}%"></i></div></div>`; }).join('') || '<small>Belum ada peserta dicentang.</small>'}</div>
  <div class="card"><h3>Pesanan Ukuran Toga</h3><div class="chips">${sizes.map(z => `<div class="chip"><b>${esc(z)}</b><small>${uk[z] || 0} orang</small></div>`).join('')}</div><p><small>Total pesanan: ${s} pcs · Belum mengisi: ${n - s}</small></p></div></div>
  <div class="card"><h3>Data Peserta & Ukuran Terkonfirmasi</h3><div class="fl" id="dtabs">
    ${[['sudah', 'Sudah Mengisi'], ['belum', 'Belum Mengisi'], ['semua', 'Semua Peserta']].map(([k, l]) => `<button class="btn sm ${f.tab === k ? '' : 'ghost'}" data-a="dtab" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="fl"><input id="dq" placeholder="Cari nama / NIM…" value="${esc(f.q)}"><select id="dp">${opts(pr, 'Semua Prodi', f.prodi)}</select><select id="du">${opts(sizes, 'Semua Ukuran', f.uk)}</select></div><div id="dt"></div></div>`;
  renderDT();
}
function renderDT() {
  const { act, ms, done } = dv(), f = A.df, q = f.q.toLowerCase();
  const rows = (f.tab === 'sudah' ? done : f.tab === 'belum' ? ms.filter(m => !act.has(m[0])) : ms).filter(m => (!f.prodi || m[2] === f.prodi) && (!f.uk || (act.get(m[0]) || [])[3] === f.uk) && (!q || (m[0] + ' ' + m[1]).toLowerCase().includes(q)));
  const pages = Math.max(1, Math.ceil(rows.length / 10)); f.pg = Math.min(f.pg, pages - 1);
  $('#dt').innerHTML = `<div class="tw"><table><tr><th>No</th><th>Mahasiswa</th><th>Prodi</th><th>Ukuran</th><th>Orang tua</th><th>Kota</th><th>WhatsApp</th><th>Waktu</th><th>Status</th></tr>
  ${rows.slice(f.pg * 10, f.pg * 10 + 10).map((m, i) => { const k = act.get(m[0]); return `<tr><td>${f.pg * 10 + i + 1}</td><td><b>${esc(m[1])}</b><br><small>${esc(m[0])}</small></td><td>${esc(m[2])}<br><small>${esc(m[3])} · ${esc(m[4])}</small></td>
  <td><b>${k ? esc(k[3]) : '-'}</b></td><td>${k ? 'Ayah: ' + esc(k[4]) + '<br>Ibu: ' + esc(k[5]) : '-'}</td><td>${k ? esc(k[6]) : '-'}</td><td>${k ? esc(k[7]) : '-'}</td><td>${k ? fmt(k[8]) : '-'}</td>
  <td><span class="pill ${k ? '' : 'wn'}">${k ? 'Terkirim' : 'Belum'}</span></td></tr>`; }).join('') || '<tr><td colspan="9"><small>Tidak ada data.</small></td></tr>'}</table></div>
  <div class="fl"><small style="flex:1">${rows.length} data · hal ${f.pg + 1}/${pages}</small><button class="btn sm ghost" data-a="dpg" data-v="-1">‹</button><button class="btn sm ghost" data-a="dpg" data-v="1">›</button></div>`;
}
const ck = nim => A.pend.has(nim) ? A.pend.get(nim) : A.ps.has(nim);
const setCk = (nim, v) => v === A.ps.has(nim) ? A.pend.delete(nim) : A.pend.set(nim, v);
function mfilt() { const f = A.mf, q = f.q.toLowerCase(); return A.d.mhs.filter(m => (!f.prodi || m[2] === f.prodi) && (!f.ang || m[3] === f.ang) && (!f.kelas || m[4] === f.kelas) && (!q || (m[0] + ' ' + m[1]).toLowerCase().includes(q)) && (!f.st || ck(m[0]) === (f.st === 'y'))); }
function renderMhs() {
  if (!A.d) return; const f = A.mf;
  $('#a-mhs').innerHTML = `<h2>Penentuan Peserta Wisuda (Yudisium)</h2><p><small>Centang mahasiswa yang berstatus yudisium. Hanya yang dicentang bisa login & mengisi form.</small></p>
  <div class="card"><div class="fl"><input id="mq" placeholder="Cari nama / NIM…" value="${esc(f.q)}"><select id="mp">${opts(uniq(2), 'Semua Prodi', f.prodi)}</select><select id="ma">${opts(uniq(3), 'Semua Angkatan', f.ang)}</select>
  <select id="mk">${opts(uniq(4), 'Semua Kelas', f.kelas)}</select><select id="ms"><option value="">Semua Status</option><option value="y" ${f.st === 'y' ? 'selected' : ''}>Tercentang</option><option value="n" ${f.st === 'n' ? 'selected' : ''}>Belum dicentang</option></select></div>
  <div class="fl"><button class="btn sm" data-a="selall">✔ Pilih Semua Hasil Filter</button><button class="btn sm ghost" data-a="unall">Hapus Centang Hasil Filter</button><small id="mc" style="align-self:center"></small></div><div id="mt"></div></div>`;
  renderMT();
}
function renderMT() {
  const rows = mfilt(), f = A.mf, pages = Math.max(1, Math.ceil(rows.length / 25)); f.pg = Math.min(f.pg, pages - 1);
  const { act } = dv(); let tot = 0; A.d.mhs.forEach(m => { if (ck(m[0])) tot++; });
  $('#mc').textContent = `Menampilkan ${rows.length} mahasiswa · ${tot} tercentang`;
  $('#mt').innerHTML = `<div class="tw"><table><tr><th></th><th>NIM</th><th>Nama</th><th>Prodi</th><th>Angk/Kelas</th><th>Yudisium</th><th>Isian</th></tr>
  ${rows.slice(f.pg * 25, f.pg * 25 + 25).map(m => `<tr><td><input type="checkbox" style="width:20px;margin:0" data-nim="${esc(m[0])}" ${ck(m[0]) ? 'checked' : ''}></td><td>${esc(m[0])}</td><td><b>${esc(m[1])}</b></td><td>${esc(m[2])}</td><td>${esc(m[3])} · ${esc(m[4])}</td>
  <td><span class="pill ${ck(m[0]) ? '' : 'wn'}">${ck(m[0]) ? 'Yudisium' : 'Belum'}</span></td><td>${act.has(m[0]) ? '<span class="pill">Sudah mengisi</span>' : '<small>-</small>'}</td></tr>`).join('') || '<tr><td colspan="7"><small>Tidak ada data.</small></td></tr>'}</table></div>
  <div class="fl"><small style="flex:1">Hal ${f.pg + 1}/${pages}</small><button class="btn sm ghost" data-a="mpg" data-v="-1">‹</button><button class="btn sm ghost" data-a="mpg" data-v="1">›</button></div>`;
  let bar = $('#sv'); if (!A.pend.size) { bar?.remove(); return; }
  if (!bar) { bar = document.createElement('div'); bar.id = 'sv'; bar.className = 'sv'; $('#a-app').appendChild(bar); }
  bar.innerHTML = `<span>🔔 <b>${A.pend.size}</b> perubahan belum disimpan</span><span><button class="btn sm ghost" data-a="mcancel">Batal</button><button class="btn sm" data-a="msave">Simpan Perubahan Peserta</button></span>`;
}
async function psave() {
  const add = [], del = []; A.pend.forEach((v, k) => v ? add.push(k) : del.push(k)); if (!add.length && !del.length) return;
  const bk = [A.d.pst.slice(), new Map(A.pend)], ds = new Set(del);
  A.d.pst = A.d.pst.filter(x => !ds.has(x)).concat(add); A.ps = new Set(A.d.pst); A.pend.clear(); renderMT(); renderDash(); toast('Menyimpan perubahan…'); // optimistic
  const r = await api('adminSavePeserta', { add, del }); if (r.auth) return alogout(true);
  if (r.success) { toast('Tersimpan ke sheet PESERTA ✔'); jset('tc_ad', A.d, sessionStorage); }
  else { A.d.pst = bk[0]; A.ps = new Set(A.d.pst); A.pend = bk[1]; renderMT(); renderDash(); toast(r.message, 1); }
}
function renderCfg() {
  const c = A.d.cfg, z = JSON.parse(c.ukuran).map(x => x.l + ' | ' + x.k).join('\n'), tz = JSON.parse(c.tabel_ukuran || '[]').map(x => [x.l, x.ld, x.pj, x.pjt].join(' | ')).join('\n');
  $('#a-cfg').innerHTML = `<h2>Pengaturan Portal</h2><form id="cf"><div class="two"><div class="card"><h3>Status & Aksesibilitas Portal</h3>
  <label class="ck"><input type="checkbox" name="manual" ${c.portal_manual === 'BUKA' ? 'checked' : ''}> Portal dibuka (sakelar manual)</label>
  <label>Batas waktu otomatis (WIB)<input type="datetime-local" name="batas" value="${esc(c.batas)}"></label><small>Portal tertutup bila salah satu: sakelar mati ATAU melewati batas waktu.</small>
  <label>Pesan saat portal ditutup<textarea name="pesan_tutup" rows="3">${esc(c.pesan_tutup)}</textarea></label></div>
  <div class="card"><h3>Ukuran Toga & Panduan</h3><label>Daftar ukuran (satu per baris: LABEL | keterangan)<textarea name="ukuran" rows="8">${esc(z)}</textarea></label>
  <label>Tabel ukuran untuk info (satu per baris: UKURAN | LD | PJ | PJT)<textarea name="tabel_ukuran" rows="5">${esc(tz)}</textarea></label><small>Hanya ditampilkan sebagai informasi. Pilihan di form mahasiswa memakai daftar di atas.</small>
  <label>Gambar panduan ukuran (tempel link Google Drive biasa atau ID file; file harus dibagikan "Siapa saja yang memiliki link")<input name="gambar" value="${esc(c.gambar)}"></label></div></div>
  <div class="card"><h3>Informasi Publik (Beranda)</h3><label>Tahun akademik<input name="tahun" value="${esc(c.tahun)}"></label>
  <label>Informasi tanggal wisuda<textarea name="wisuda_info" rows="3">${esc(c.wisuda_info)}</textarea></label><label>Informasi gladi & pengambilan toga<textarea name="gladi_info" rows="3">${esc(c.gladi_info)}</textarea></label>
  <label>Informasi pembayaran wisuda<textarea name="bayar_info" rows="3">${esc(c.bayar_info)}</textarea></label><label>No. WhatsApp panitia (mis. 0812…)<input name="hotline_wa" inputmode="numeric" value="${esc(c.hotline_wa)}"></label></div>
  <button class="btn big" data-a="csave">💾 Simpan Pengaturan</button></form>`;
}
async function csave(e) {
  const o = Object.fromEntries(new FormData($('#cf')));
  const z = o.ukuran.split('\n').map(x => x.trim()).filter(Boolean).map(x => { const [l, ...k] = x.split('|'); return { l: l.trim(), k: k.join('|').trim() }; });
  if (!z.length) return toast('Daftar ukuran tidak boleh kosong', 1);
  const tb = (o.tabel_ukuran || '').split('\n').map(x => x.trim()).filter(Boolean).map(x => { const [l, ld, pj, pjt] = x.split('|').map(y => y.trim()); return { l, ld, pj, pjt }; }).filter(r => r.l);
  const cfg = { tabel_ukuran: JSON.stringify(tb), tahun: o.tahun, wisuda_info: o.wisuda_info, gladi_info: o.gladi_info, bayar_info: o.bayar_info, hotline_wa: o.hotline_wa, gambar: o.gambar.trim(), pesan_tutup: o.pesan_tutup, batas: o.batas, portal_manual: o.manual ? 'BUKA' : 'TUTUP', ukuran: JSON.stringify(z) };
  const old = { ...A.d.cfg }; Object.assign(A.d.cfg, cfg); toast('Menyimpan pengaturan…');
  const r = await api('adminSaveSettings', { cfg }); if (r.auth) return alogout(true);
  if (r.success) { S.pub = r.pub; jset('tc_pub', r.pub); jset('tc_ad', A.d, sessionStorage); renderHome(); renderDash(); toast('Pengaturan tersimpan ✔ (langsung aktif di portal)'); }
  else { A.d.cfg = old; toast(r.message, 1); }
}
function exportCsv() {
  const { act, done } = dv(), t = v => '="' + String(v ?? '').replace(/"/g, '""') + '"', q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const L = [['NIM', 'Nama', 'Prodi', 'Angkatan', 'Kelas', 'Ukuran Toga', 'Nama Ayah', 'Nama Ibu', 'Kota Asal', 'No WhatsApp', 'Waktu Kirim'].map(q).join(',')], cnt = {};
  done.forEach(m => { const k = act.get(m[0]); cnt[k[3]] = (cnt[k[3]] || 0) + 1;
    L.push([t(m[0]), q(m[1]), q(m[2]), q(m[3]), q(m[4]), q(k[3]), q(k[4]), q(k[5]), q(k[6]), t(k[7]), q(fmt(k[8]))].join(',')); });
  L.push('', q('RINGKASAN UKURAN TOGA')); JSON.parse(A.d.cfg.ukuran).forEach(u => L.push(q(u.l) + ',' + (cnt[u.l] || 0)));
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + L.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  a.download = 'konfirmasi-toga-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// ===================== EVENTS =====================
const ACT = {
  login: openLogin, close: closeModal, home: () => go('home'), cancel: cancelKonf,
  sync: () => { toast('Menyinkronkan data…'); aboot(true); }, csv: exportCsv, logout: () => alogout(),
  dtab: t => { A.df.tab = t.dataset.v; A.df.pg = 0; renderDash(); }, dpg: t => { A.df.pg = Math.max(0, A.df.pg + +t.dataset.v); renderDT(); },
  mpg: t => { A.mf.pg = Math.max(0, A.mf.pg + +t.dataset.v); renderMT(); },
  selall: () => { mfilt().forEach(m => setCk(m[0], true)); renderMT(); }, unall: () => { mfilt().forEach(m => setCk(m[0], false)); renderMT(); },
  mcancel: () => { A.pend.clear(); renderMT(); }, msave: psave, csave: (t, e) => { e.preventDefault(); csave(); }
};
document.addEventListener('click', e => {
  A.act = Date.now();
  const n = e.target.closest('#bn [data-n]'); if (n) return nav(n.dataset.n);
  const t = e.target.closest('[data-a]'); if (t) { ACT[t.dataset.a]?.(t, e); return; }
  const tb = e.target.closest('.tb'); if (tb) { $$('.tb').forEach(b => b.classList.toggle('on', b === tb)); $$('.av').forEach(s => s.classList.toggle('on', s.id === 'a-' + tb.dataset.t)); }
});
document.addEventListener('change', e => {
  const t = e.target, f = A.mf, d = A.df;
  if (t.dataset.nim) { setCk(t.dataset.nim, t.checked); renderMT(); }
  else if (t.id === 'mp' || t.id === 'ma' || t.id === 'mk' || t.id === 'ms') { f.prodi = $('#mp').value; f.ang = $('#ma').value; f.kelas = $('#mk').value; f.st = $('#ms').value; f.pg = 0; renderMT(); }
  else if (t.id === 'dp' || t.id === 'du') { d.prodi = $('#dp').value; d.uk = $('#du').value; d.pg = 0; renderDT(); }
});
let dbt; document.addEventListener('input', e => {
  const t = e.target; if (t.closest('#f')) return chk(true);
  if (t.id === 'mq' || t.id === 'dq') { clearTimeout(dbt); dbt = setTimeout(() => { if (t.id === 'mq') { A.mf.q = t.value; A.mf.pg = 0; renderMT(); } else { A.df.q = t.value; A.df.pg = 0; renderDT(); } }, 150); }
});
document.addEventListener('submit', async e => {
  e.preventDefault(); const t = e.target;
  if (t.id === 'f') submit();
  else if (t.id === 'nf') doLogin(new FormData(t).get('nim'));
  else if (t.id === 'alf') {
    const b = $('#alb'), o = Object.fromEntries(new FormData(t)); b.disabled = true; b.textContent = 'Memeriksa…';
    const r = await api('adminLogin', { username: o.u, password: o.p }, 1); b.disabled = false; b.textContent = 'Masuk';
    if (r.success) { A.token = r.token; localStorage.setItem('tc_tk', r.token); t.reset(); route(); } else toast(r.message, 1);
  }
});
window.addEventListener('beforeunload', e => { if (A.pend.size) { e.preventDefault(); e.returnValue = ''; } });
window.addEventListener('hashchange', route);
setInterval(() => { if (A.token && Date.now() - A.act > 3600e3) alogout(true); }, 60000);

renderHome(); loadPub(); route();
if ('serviceWorker' in navigator) { /* opsional: tambahkan service worker untuk offline */ }
