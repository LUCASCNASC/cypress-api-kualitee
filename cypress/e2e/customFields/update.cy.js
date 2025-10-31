describe('API - Custom Fields Update - /customfields/update', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validCustomFieldId = 456;
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validFieldType = 'textbox';
  const validCustomFieldModule = 'TestScenario';
  const validCustomFieldName = 'MeuCampoCustomizadoAtualizado';
  const validCustomFieldDesc = 'Descrição atualizada do campo customizado';
  const PATH_API = '/Custom%20Fields/Update'

  function customfieldsUpdate(body, options = {}) {
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
  it('Atualiza custom field com todos os campos obrigatórios', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Atualiza custom field com todos os parâmetros preenchidos', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      field_type: validFieldType,
      'custom_field_module[0]': validCustomFieldModule,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    customfieldsUpdate({
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      customfieldsUpdate({
        token,
        custom_field_id: validCustomFieldId,
        'project_id[0]': validProjectId,
        custom_field_name: validCustomFieldName,
        custom_field_desc: validCustomFieldDesc
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- custom_field_id inválido, ausente, tipos errados, limites ---
  it('Falha sem custom_field_id', () => {
    customfieldsUpdate({
      token: validToken,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(custom_field_id => {
    it(`Falha com custom_field_id inválido (${JSON.stringify(custom_field_id)})`, () => {
      customfieldsUpdate({
        token: validToken,
        custom_field_id,
        'project_id[0]': validProjectId,
        custom_field_name: validCustomFieldName,
        custom_field_desc: validCustomFieldDesc
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- project_id[0] inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id[0]', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id[0] inválido (${JSON.stringify(project_id)})`, () => {
      customfieldsUpdate({
        token: validToken,
        custom_field_id: validCustomFieldId,
        'project_id[0]': project_id,
        custom_field_name: validCustomFieldName,
        custom_field_desc: validCustomFieldDesc
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- custom_field_name inválido, ausente, tipos errados, limites ---
  it('Falha sem custom_field_name', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(custom_field_name => {
    it(`Falha com custom_field_name inválido (${JSON.stringify(custom_field_name)})`, () => {
      customfieldsUpdate({
        token: validToken,
        custom_field_id: validCustomFieldId,
        'project_id[0]': validProjectId,
        custom_field_name,
        custom_field_desc: validCustomFieldDesc
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- custom_field_desc inválido, ausente, tipos errados, limites ---
  it('Falha sem custom_field_desc', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(custom_field_desc => {
    it(`Falha com custom_field_desc inválido (${JSON.stringify(custom_field_desc)})`, () => {
      customfieldsUpdate({
        token: validToken,
        custom_field_id: validCustomFieldId,
        'project_id[0]': validProjectId,
        custom_field_name: validCustomFieldName,
        custom_field_desc
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- field_type inválido (valores não permitidos) ---
  ['INVALID', 123, {}, [], true, false].forEach(field_type => {
    it(`Falha com field_type inválido (${JSON.stringify(field_type)})`, () => {
      customfieldsUpdate({
        token: validToken,
        custom_field_id: validCustomFieldId,
        'project_id[0]': validProjectId,
        field_type,
        custom_field_name: validCustomFieldName,
        custom_field_desc: validCustomFieldDesc
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- custom_field_module[0] inválido (valores não permitidos) ---
  ['INVALID', 123, {}, [], true, false].forEach(custom_field_module => {
    it(`Falha com custom_field_module[0] inválido (${JSON.stringify(custom_field_module)})`, () => {
      customfieldsUpdate({
        token: validToken,
        custom_field_id: validCustomFieldId,
        'project_id[0]': validProjectId,
        field_type: validFieldType,
        'custom_field_module[0]': custom_field_module,
        custom_field_name: validCustomFieldName,
        custom_field_desc: validCustomFieldDesc
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc,
      extra: 'foo'
    }).then(response => {
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
        body: {
          token: validToken,
          custom_field_id: validCustomFieldId,
          'project_id[0]': validProjectId,
          custom_field_name: validCustomFieldName,
          custom_field_desc: validCustomFieldDesc
        },
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
      body: {
        token: validToken,
        custom_field_id: validCustomFieldId,
        'project_id[0]': validProjectId,
        custom_field_name: validCustomFieldName,
        custom_field_desc: validCustomFieldDesc
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    customfieldsUpdate({
      token: "' OR 1=1 --",
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      customfieldsUpdate({
        token: validToken,
        custom_field_id: validCustomFieldId,
        'project_id[0]': validProjectId,
        custom_field_name: validCustomFieldName,
        custom_field_desc: validCustomFieldDesc
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    })
    .then(() =>
      customfieldsUpdate({
        token: validToken,
        custom_field_id: validCustomFieldId,
        'project_id[0]': validProjectId,
        custom_field_name: validCustomFieldName,
        custom_field_desc: validCustomFieldDesc
      }))
    .then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});