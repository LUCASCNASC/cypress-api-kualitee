const PATH_API = '/Roles/Delete';
const validToken = Cypress.env('VALID_TOKEN');

const validIdSingle = Cypress.env('VALID_IDS_SINGLE');

const validIdArray = [123];

describe('Roles Delete - /roles/delete', () => {

  it('Status Code is 200', () => {
    rolesDelete({ token: validToken, 'id[0]': validIdArray[0] }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Deleta múltiplos roles com vários id[0], id[1]...', () => {
    rolesDelete({ token: validToken, 'id[0]': 111, 'id[1]': 222, 'id[2]': 333 }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    rolesDelete({ 'id[0]': validIdSingle }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    rolesDelete({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    rolesDelete({ token: validToken, 'id[0]': validIdSingle, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, 'id[0]': validIdSingle },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    rolesDelete({ token: "' OR 1=1 --", 'id[0]': validIdSingle }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    rolesDelete({ token: validToken, 'id[0]': validIdSingle }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      rolesDelete({ token: validToken, 'id[0]': validIdSingle })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    rolesDelete({ token: validToken, 'id[0]': validIdSingle })
      .then(() => rolesDelete({ token: validToken, 'id[0]': validIdSingle }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});