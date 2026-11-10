async function runAudit() {
  console.log('======================================================');
  console.log('       CONSENT CONSOLE — SYSTEM AUDIT REPORT          ');
  console.log('======================================================\n');

  const results = {
    functional: [],
    security: [],
  };

  // --- 1. FUNCTIONAL AUDIT: ROUTE ACCESSIBILITY ---
  console.log('[1/4] AUDITING APPLICATION ROUTES...');
  const routes = ['/', '/settings', '/policies', '/activity', '/about'];
  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      if (res.status === 200) {
        results.functional.push({ test: `Route ${route} status 200`, passed: true });
        console.log(`  ✓ Route ${route} -> 200 OK`);
      } else {
        results.functional.push({ test: `Route ${route} status 200`, passed: false, detail: res.status });
        console.log(`  ✗ Route ${route} -> ${res.status}`);
      }
    } catch (err) {
      results.functional.push({ test: `Route ${route}`, passed: false, detail: err.message });
      console.log(`  ✗ Route ${route} -> Failed: ${err.message}`);
    }
  }

  // --- 2. FUNCTIONAL AUDIT: API ENDPOINTS ---
  console.log('\n[2/4] AUDITING API ENDPOINTS...');
  try {
    const cat = await (await fetch('http://localhost:3000/api/catalog')).json();
    const catPassed = cat.success && cat.catalog.length >= 3;
    results.functional.push({ test: 'API: /api/catalog', passed: catPassed });
    console.log(`  ${catPassed ? '✓' : '✗'} API /api/catalog -> ${cat.catalog.length} items loaded`);

    const pol = await (await fetch('http://localhost:3000/api/policy/config')).json();
    const polPassed = pol.success && pol.config.dailySpendCap > 0;
    results.functional.push({ test: 'API: /api/policy/config GET', passed: polPassed });
    console.log(`  ${polPassed ? '✓' : '✗'} API /api/policy/config GET -> Spend Cap: ₹${pol.config.dailySpendCap}`);

    const events = await (await fetch('http://localhost:3000/api/events?format=json')).json();
    const evtPassed = events.success && Array.isArray(events.events);
    results.functional.push({ test: 'API: /api/events GET', passed: evtPassed });
    console.log(`  ${evtPassed ? '✓' : '✗'} API /api/events GET -> ${events.events.length} events retrieved`);
  } catch (e) {
    console.error('API Audit error:', e.message);
  }

  // --- 3. SECURITY AUDIT: POLICY GATE & OWASP ENFORCEMENT ---
  console.log('\n[3/4] AUDITING SECURITY CONTROLS (OWASP TOP 10 2026)...');

  // Test A: Normal Approved Transaction
  try {
    const normalRun = await (await fetch('http://localhost:3000/api/agent/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'prod-001' })
    })).json();

    const normalApproved = normalRun.result?.toolResult?.success === true && normalRun.result?.toolResult?.blocked === false;
    results.security.push({ test: 'Authorized Purchase within Spend Cap Approved', passed: normalApproved });
    console.log(`  ${normalApproved ? '✓' : '✗'} Authorized Purchase: Approved -> Status: ${normalRun.result?.toolResult?.policyStatus}`);
  } catch (err) {
    results.security.push({ test: 'Authorized Purchase Execution', passed: false, detail: err.message });
  }

  // Test B: Indirect Prompt Injection Attack Interception (OWASP LLM01, LLM03, ASI01)
  try {
    const attackRun = await (await fetch('http://localhost:3000/api/agent/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'prod-003', forceAttackScenario: true })
    })).json();

    const blocked = attackRun.result?.toolResult?.blocked === true;
    const violations = attackRun.result?.toolResult?.violations || [];
    const hasCapViolation = violations.some(v => v.toLowerCase().includes('limit') || v.toLowerCase().includes('cap'));
    const hasInjectionViolation = violations.some(v => v.toLowerCase().includes('injection'));

    const securityPassed = blocked && hasCapViolation && hasInjectionViolation;
    results.security.push({ test: 'Indirect Prompt Injection Blocked on Multiple Grounds', passed: securityPassed });
    console.log(`  ${securityPassed ? '✓' : '✗'} Attack Interception: Blocked -> Caught ${violations.length} violations:`);
    violations.forEach(v => console.log(`      - ${v}`));
  } catch (err) {
    results.security.push({ test: 'Attack Interception Test', passed: false, detail: err.message });
  }

  // Test C: Emergency Kill Switch Enforcement
  try {
    // Engage Kill Switch
    await fetch('http://localhost:3000/api/policy/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ killSwitchActive: true })
    });

    const pausedRun = await (await fetch('http://localhost:3000/api/agent/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'prod-001' })
    })).json();

    const killSwitchBlocked = pausedRun.result?.toolResult?.blocked === true;
    results.security.push({ test: 'Emergency Kill Switch Halts All Purchases', passed: killSwitchBlocked });
    console.log(`  ${killSwitchBlocked ? '✓' : '✗'} Master Safety Pause: Successfully prevented purchase when engaged`);

    // Restore Kill Switch to active
    await fetch('http://localhost:3000/api/policy/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ killSwitchActive: false })
    });
  } catch (err) {
    results.security.push({ test: 'Kill Switch Test', passed: false, detail: err.message });
  }

  // --- 4. SUMMARY REPORT ---
  console.log('\n[4/4] AUDIT SUMMARY');
  const allTests = [...results.functional, ...results.security];
  const passedCount = allTests.filter(t => t.passed).length;
  console.log(`  Total Checks: ${allTests.length}`);
  console.log(`  Passed: ${passedCount}`);
  console.log(`  Failed: ${allTests.length - passedCount}`);
  console.log(`  Overall Compliance Score: ${Math.round((passedCount / allTests.length) * 100)}%\n`);

  if (passedCount === allTests.length) {
    console.log('✓ ALL SECURITY & FUNCTIONALITY CRITERIA VERIFIED');
  }
}

runAudit();
