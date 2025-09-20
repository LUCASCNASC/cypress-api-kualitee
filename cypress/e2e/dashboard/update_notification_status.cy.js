describe('API - Dashboard Update Notification Status - /dashboard/update_notification_status', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validIds = [100, 101]; // Substitua por ids de notificação válidos do seu ambiente

  function updateNotificationStatus(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/Dashboard/UpdateNotificationstatus`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Atualiza status de notificação com token, project_id e ids válidos', () => {
    updateNotificationStatus({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    updateNotificationStatus({ project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    updateNotificationStatus({ token: 'token_invalido', project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    updateNotificationStatus({ token: 'token_expirado', project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    updateNotificationStatus({ token: null, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    updateNotificationStatus({ token: '😀🔥💥', project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    updateNotificationStatus({ token: "' OR 1=1 --", project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    updateNotificationStatus({ token: validToken, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      updateNotificationStatus({ token: validToken, project_id, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    updateNotificationStatus({ token: validToken, project_id: 999999, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  // --- id[x] inválido, ausente, tipos errados, limites ---
  ['id[0]', 'id[1]'].forEach(idKey => {
    [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(invalidValue => {
      it(`Falha com campo '${idKey}' inválido (${JSON.stringify(invalidValue)})`, () => {
        updateNotificationStatus({ token: validToken, project_id: validProjectId, [idKey]: invalidValue, 'id[1]': validIds[1], 'id[0]': validIds[0] }).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    updateNotificationStatus({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1], extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `${BASE_URL}/Dashboard/UpdateNotificationstatus`,
        form: true,
        body: { token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] },
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
      url: `${BASE_URL}/Dashboard/UpdateNotificationstatus`,
      body: { token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    updateNotificationStatus({ token: "' OR 1=1 --", project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    updateNotificationStatus({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      updateNotificationStatus({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    updateNotificationStatus({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] })
      .then(() => updateNotificationStatus({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});