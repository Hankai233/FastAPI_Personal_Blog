class TestPublicPosts:
    def test_list_empty(self, client):
        resp = client.get("/api/posts")
        assert resp.status_code == 200
        body = resp.json()
        assert body["data"] == []
        assert body["total"] == 0

    def test_create_and_list_posts(self, client, auth_headers, sample_tags):
        post_data = {
            "title": "Hello World",
            "slug": "hello-world",
            "content_md": "# Hello\n\nThis is a test post.",
            "tag_ids": [t["id"] for t in sample_tags],
            "status": "published",
        }
        create_resp = client.post("/api/admin/posts", json=post_data, headers=auth_headers)
        assert create_resp.status_code == 201
        created = create_resp.json()
        assert created["title"] == "Hello World"
        assert created["content_html"].startswith("<h1>Hello</h1>")
        assert len(created["tags"]) == 3

        # List
        list_resp = client.get("/api/posts")
        assert list_resp.status_code == 200
        assert list_resp.json()["total"] == 1

    def test_get_by_slug(self, client, auth_headers, sample_tags):
        client.post("/api/admin/posts", json={
            "title": "Test Post",
            "slug": "test-post",
            "content_md": "Content here",
            "tag_ids": [],
            "status": "published",
        }, headers=auth_headers)
        resp = client.get("/api/posts/test-post")
        assert resp.status_code == 200
        assert resp.json()["slug"] == "test-post"

    def test_draft_not_visible(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "Draft Post",
            "slug": "draft-post",
            "content_md": "Secret draft",
        }, headers=auth_headers)
        resp = client.get("/api/posts/draft-post")
        assert resp.status_code == 404

    def test_get_nonexistent_post(self, client):
        resp = client.get("/api/posts/no-such-post")
        assert resp.status_code == 404

    def test_update_post(self, client, auth_headers, sample_tags):
        client.post("/api/admin/posts", json={
            "title": "Original",
            "slug": "original",
            "content_md": "Original content",
            "tag_ids": [],
            "status": "published",
        }, headers=auth_headers)
        resp = client.put("/api/admin/posts/original", json={
            "title": "Updated",
        }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated"

    def test_delete_post(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "To Delete",
            "slug": "to-delete",
            "content_md": "Will be removed",
        }, headers=auth_headers)
        resp = client.delete("/api/admin/posts/to-delete", headers=auth_headers)
        assert resp.status_code == 200
        assert client.get("/api/posts/to-delete").status_code == 404

    def test_unauthorized_create(self, client):
        resp = client.post("/api/admin/posts", json={
            "title": "No Auth",
            "slug": "no-auth",
            "content_md": "Should fail",
        })
        assert resp.status_code == 401

    def test_duplicate_slug(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "First",
            "slug": "same-slug",
            "content_md": "First post",
        }, headers=auth_headers)
        resp = client.post("/api/admin/posts", json={
            "title": "Second",
            "slug": "same-slug",
            "content_md": "Second post",
        }, headers=auth_headers)
        assert resp.status_code == 400
