const validToken = Cypress.env('VALID_TOKEN');

describe('API - Custom Fields Delete - /customfields/delete', () => {
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validCustomFieldId = 123;
  const PATH_API = '/Custom%20Fields/Delete'

  function customfieldsDelete(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Deleta custom field com token, project_id e custom_field_id[0] válidos', () => {
    customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    customfieldsDelete({ project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      customfieldsDelete({ token, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    customfieldsDelete({ token: validToken, 'custom_field_id[0]': validCustomFieldId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      customfieldsDelete({ token: validToken, project_id, 'custom_field_id[0]': validCustomFieldId }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- custom_field_id[0] inválido, ausente, tipos errados, limites ---
  it('Falha sem custom_field_id[0]', () => {
    customfieldsDelete({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(custom_field_id => {
    it(`Falha com custom_field_id[0] inválido (${JSON.stringify(custom_field_id)})`, () => {
      customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': custom_field_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: { token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId },
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
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    customfieldsDelete({ token: "' OR 1=1 --", project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId })
      .then(() => customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});