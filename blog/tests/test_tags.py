class TestTags:
    def test_list_empty(self, client):
        resp = client.get("/api/tags")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_create_and_list(self, client, auth_headers):
        resp = client.post("/api/admin/tags", json={
            "name": "Python",
            "slug": "python",
        }, headers=auth_headers)
        assert resp.status_code == 201
        assert resp.json()["name"] == "Python"

        list_resp = client.get("/api/tags")
        assert len(list_resp.json()) == 1

    def test_create_duplicate(self, client, auth_headers):
        client.post("/api/admin/tags", json={"name": "Dup", "slug": "dup"}, headers=auth_headers)
        resp = client.post("/api/admin/tags", json={"name": "Dup", "slug": "dup"}, headers=auth_headers)
        assert resp.status_code == 400

    def test_update_tag(self, client, auth_headers):
        created = client.post("/api/admin/tags", json={"name": "Old", "slug": "old"}, headers=auth_headers)
        tag_id = created.json()["id"]
        resp = client.put(f"/api/admin/tags/{tag_id}", json={"name": "New"}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["name"] == "New"

    def test_delete_tag(self, client, auth_headers):
        created = client.post("/api/admin/tags", json={"name": "Del", "slug": "del"}, headers=auth_headers)
        tag_id = created.json()["id"]
        resp = client.delete(f"/api/admin/tags/{tag_id}", headers=auth_headers)
        assert resp.status_code == 200
