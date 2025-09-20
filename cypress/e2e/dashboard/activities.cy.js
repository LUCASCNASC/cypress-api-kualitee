describe('API - Dashboard Activities - /dashboard/activities', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validId = 'user_or_entity_id'; // Substitua por um valor válido se necessário

  function dashboardActivities(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/Dashboard/Activities`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Retorna atividades com token, project_id e show válidos', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Retorna atividades filtrando por id', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, id: validId, show: 'me' }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    dashboardActivities({ project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    dashboardActivities({ token: 'token_invalido', project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    dashboardActivities({ token: 'token_expirado', project_id: validProjectId, show: 'all' }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    dashboardActivities({ token: null, project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    dashboardActivities({ token: '😀🔥💥', project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    dashboardActivities({ token: "' OR 1=1 --", project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    dashboardActivities({ token: validToken, show: 'all' }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      dashboardActivities({ token: validToken, project_id, show: 'all' }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    dashboardActivities({ token: validToken, project_id: 999999, show: 'all' }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  // --- id inválido ---
  [null, '', 123, {}, [], true, false].forEach(invalidId => {
    it(`Falha com id inválido (${JSON.stringify(invalidId)})`, () => {
      dashboardActivities({ token: validToken, project_id: validProjectId, id: invalidId, show: 'me' }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- show inválido, ausente ---
  it('Falha sem show', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  ['invalid', '', null, 123, {}, [], true, false].forEach(invalidShow => {
    it(`Falha com show inválido (${JSON.stringify(invalidShow)})`, () => {
      dashboardActivities({ token: validToken, project_id: validProjectId, show: invalidShow }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all', extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `${BASE_URL}/Dashboard/Activities`,
        form: true,
        body: { token: validToken, project_id: validProjectId, show: 'all' },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/Dashboard/Activities`,
      body: { token: validToken, project_id: validProjectId, show: 'all' },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    dashboardActivities({ token: "' OR 1=1 --", project_id: validProjectId, show: 'all' }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' })
      .then(() => dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});