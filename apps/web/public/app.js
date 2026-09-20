(function () {
  'use strict';
  var els = {
    form: document.getElementById('brief-form'),
    brief: document.getElementById('brief'),
    autonomy: document.getElementById('autonomy'),
    phases: document.getElementById('phases'),
    issues: document.getElementById('issues'),
    gate: document.getElementById('gate'),
    log: document.getElementById('log'),
    preview: document.getElementById('preview'),
    empty: document.getElementById('empty'),
    health: document.getElementById('health'),
    label: document.getElementById('canvas-label')
  };

  function log(line) {
    els.log.textContent += line + '\n';
    els.log.parentElement.scrollTop = els.log.parentElement.scrollHeight;
  }

  fetch('/api/health').then(function (r) { return r.json(); }).then(function (h) {
    els.health.textContent = 'v' + h.version + ' · ' + h.providers.join(',') + ' · ' + h.skills + ' skills';
  }).catch(function () { els.health.textContent = 'daemon no disponible'; });

  document.querySelectorAll('.mode').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.mode').forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
      els.label.textContent = b.dataset.mode === 'preview' ? 'Live canvas' : b.dataset.mode.toUpperCase();
    });
  });

  document.querySelectorAll('.vp').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.vp').forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
      els.preview.style.width = b.dataset.vp === '100%' ? '100%' : b.dataset.vp + 'px';
    });
  });

  els.form.addEventListener('submit', function (e) {
    e.preventDefault();
    var brief = els.brief.value.trim() || els.brief.placeholder;
    els.phases.innerHTML = '';
    els.issues.innerHTML = '';
    els.gate.textContent = 'Ejecutando…';
    els.gate.className = 'gate muted';
    log('▸ run: ' + brief);
    var btn = els.form.querySelector('.btn');
    btn.disabled = true;

    fetch('/api/runs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ brief: brief, autonomy: els.autonomy.value })
    }).then(function (r) { return r.json(); }).then(function (run) {
      var es = new EventSource(run.stream);
      es.addEventListener('phase', function (ev) {
        var p = JSON.parse(ev.data);
        var li = document.createElement('li');
        li.className = 'active';
        li.textContent = p.phase + (p.detail ? ' — ' + p.detail : '');
        els.phases.appendChild(li);
        log('  ' + p.phase + (p.detail ? ': ' + p.detail : ''));
      });
      es.addEventListener('issue', function (ev) {
        var i = JSON.parse(ev.data);
        if (els.issues.querySelector('.muted')) els.issues.innerHTML = '';
        var li = document.createElement('li');
        li.className = i.severity;
        li.textContent = '[' + i.severity + '] ' + i.id + ' ' + i.title;
        els.issues.appendChild(li);
      });
      es.addEventListener('error', function (ev) {
        try {
          var e2 = JSON.parse(ev.data);
          log('  ERROR ' + e2.where + ': ' + e2.what);
        } catch (x) {
          log('  ERROR (evento no parseable)'); // nunca ocultamos un error (plan 44)
        }
      });
      es.addEventListener('done', function (ev) {
        var report;
        try { report = JSON.parse(ev.data); } catch (x) { report = null; }
        if (!report || !report.gate) {
          // Evento terminal sin informe: no cerramos el stream, aún puede llegar el bueno.
          log('aviso: evento done sin informe, seguimos escuchando');
          return;
        }
        btn.disabled = false;
        if (report && report.gate) {
          els.gate.className = 'gate ' + (report.gate.verified ? 'ok' : 'fail');
          els.gate.innerHTML = '<strong>' + report.gate.level + '</strong><br>' +
            (report.gate.blocking.length ? 'Bloqueantes: ' + report.gate.blocking.join(', ') + '<br>' : '') +
            (report.gate.unverified.length ? 'Sin verificar: ' + report.gate.unverified.join(', ') : '');
          els.preview.src = '/preview/' + run.id + '/index.html';
          els.preview.classList.add('visible');
          els.empty.style.display = 'none';
          log('✓ terminado — ' + report.gate.level);
        }
        es.close();
      });
    }).catch(function (err) { btn.disabled = false; log('ERROR: ' + err.message); });
  });
})();
