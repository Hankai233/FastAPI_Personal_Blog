class TestComments:
    def test_create_comment(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "P", "slug": "p", "content_md": "test",
            "status": "published",
        }, headers=auth_headers)
        resp = client.post("/api/posts/p/comments", json={
            "author_name": "Alice",
            "author_email": "alice@example.com",
            "content": "Nice post!",
        })
        assert resp.status_code == 201
        assert resp.json()["is_approved"] == False

    def test_list_comments(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "X", "slug": "x", "content_md": "test",
            "status": "published",
        }, headers=auth_headers)
        client.post("/api/posts/x/comments", json={
            "author_name": "Bob",
            "author_email": "bob@test.com",
            "content": "Hello",
        })
        resp = client.get("/api/posts/x/comments")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_approve_comment(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "Y", "slug": "y", "content_md": "test",
            "status": "published",
        }, headers=auth_headers)
        created = client.post("/api/posts/y/comments", json={
            "author_name": "Cat", "author_email": "c@t.com", "content": "Meow",
        })
        comment_id = created.json()["id"]
        resp = client.put(f"/api/admin/comments/{comment_id}/approve", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["is_approved"] == True
