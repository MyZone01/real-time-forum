package models

import (
	"database/sql"
	"fmt"
	"log"
	"real-time-forum/lib"
	"strings"

	uuid "github.com/gofrs/uuid"
	_ "github.com/mattn/go-sqlite3"
)

type PostItem struct {
	ID                string
	Title             string
	Slug              string
	AuthorName        string
	ImageURL          string
	LastEditionDate   string
	NumberOfComments  int
	ListOfCommentator []string
}

type Post struct {
	ID           string
	Title        string
	Slug         string
	Description  string
	ImageURL     string
	AuthorID     string
	IsEdited     bool
	CreateDate   string
	ModifiedDate string
}

type PostRepository struct {
	db *sql.DB
}

func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{
		db: db,
	}
}

// Create a new post in the database
func (pr *PostRepository) CreatePost(post *Post) error {
	ID, err := uuid.NewV4()
	if err != nil {
		log.Fatalf("❌ Failed to generate UUID: %v", err)
	}
	post.ID = ID.String()
	_, err = pr.db.Exec("INSERT INTO post (id, title, slug, description, imageURL, authorID, isEdited, createDate, modifiedDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		post.ID, post.Title, post.Slug, post.Description, post.ImageURL, post.AuthorID, post.IsEdited, post.CreateDate, post.ModifiedDate)
	return err
}

// Get a post by ID from the database
func (pr *PostRepository) GetPostByID(postID string) (*Post, error) {
	var post Post
	row := pr.db.QueryRow("SELECT id, title, slug, description, imageURL, authorID, isEdited, createDate, modifiedDate FROM post WHERE id = ?", postID)
	err := row.Scan(&post.ID, &post.Title, &post.Slug, &post.Description, &post.ImageURL, &post.AuthorID, &post.IsEdited, &post.CreateDate, &post.ModifiedDate)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Post not found
		}
		return nil, err
	}
	return &post, nil
}

func (pr *PostRepository) GetUserOwnPosts(userId, userName string) ([]PostItem, error) {
	var posts []*Post
	var numberComments []int

	rows, err := pr.db.Query(`
	SELECT p.id AS id, title, slug, description, imageURL, p.authorID AS authorID, isEdited, p.createDate AS createDate , p.modifiedDate AS modifiedDate, COUNT(*) AS numberComment FROM post p
	LEFT JOIN comment c ON c.postID = p.ID
	WHERE p.authorID = ? 
	GROUP BY p.ID ;
	`, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post Post
		var nbComment int
		err := rows.Scan(&post.ID, &post.Title, &post.Slug, &post.Description, &post.ImageURL, &post.AuthorID, &post.IsEdited, &post.CreateDate, &post.ModifiedDate, &nbComment)
		if err != nil {
			return nil, err
		}
		posts = append(posts, &post)
		numberComments = append(numberComments, nbComment)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	tabPostItem := []PostItem{}

	for i := 0; i < len(posts); i++ {
		lastModificationDate := strings.ReplaceAll(posts[i].ModifiedDate, "T", " ")
		lastModificationDate = strings.ReplaceAll(lastModificationDate, "Z", "")
		urlImage := strings.ReplaceAll(posts[i].ImageURL, "jpg", "jpg")
		postItem := PostItem{
			ID:                posts[i].ID,
			Title:             posts[i].Title,
			Slug:              posts[i].Slug,
			AuthorName:        userName,
			ImageURL:          urlImage,
			LastEditionDate:   lib.TimeSinceCreation(lastModificationDate),
			NumberOfComments:  numberComments[i],
			ListOfCommentator: []string{},
		}
		tabPostItem = append(tabPostItem, postItem)

	}

	return tabPostItem, nil
}

// Get a post by TITLE from the database
func (pr *PostRepository) GetPostBySlug(slug string) (*Post, error) {
	var post Post
	row := pr.db.QueryRow("SELECT id, title, slug, description, imageURL, authorID, isEdited, createDate, modifiedDate FROM post WHERE slug = ?", slug)
	err := row.Scan(&post.ID, &post.Title, &post.Slug, &post.Description, &post.ImageURL, &post.AuthorID, &post.IsEdited, &post.CreateDate, &post.ModifiedDate)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Post not found
		}
		return nil, err
	}
	return &post, nil
}

// Get all posts from database
func (pr *PostRepository) GetAllPosts() ([]*Post, error) {
	var posts []*Post
	requete := "SELECT id, title, slug, description, imageURL, authorID, isEdited, createDate, modifiedDate FROM post"
	rows, err := pr.db.Query(requete)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post Post
		err := rows.Scan(&post.ID, &post.Title, &post.Slug, &post.Description, &post.ImageURL, &post.AuthorID, &post.IsEdited, &post.CreateDate, &post.ModifiedDate)
		if err != nil {
			return nil, err
		}
		posts = append(posts, &post)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil
}

// Get user's comment by post
func (pr *PostRepository) GetUserReaction(userID string) (map[Post][]Comment, error) {
	commentMap := make(map[Post][]Comment)
	// var posts []Post
	// var comments []Comment
	rows, err := pr.db.Query("SELECT p.*, c.* FROM post p JOIN comment c ON p.id = c.postID JOIN user u ON c.authorID = u.id WHERE u.id = ? ORDER BY c.modifieddate DESC", userID)
	if err != nil {
		fmt.Println("1", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post Post
		var comment Comment
		err := rows.Scan(&post.ID, &post.Title, &post.Slug, &post.Description, &post.ImageURL, &post.AuthorID, &post.IsEdited, &post.CreateDate, &post.ModifiedDate, &comment.ID, &comment.Text, &comment.AuthorID, &comment.PostID, &comment.ParentID, &comment.CreateDate, &comment.ModifiedDate)
		if err != nil {
			fmt.Println("2", err)
			return nil, err
		}
		pos, err := UserRepo.GetUserByID(post.AuthorID)
		if err != nil {
			return nil, err
		}
		post.AuthorID = pos.Nickname

		comment.ModifiedDate = lib.FormatDateDB(comment.ModifiedDate)
		post.ModifiedDate = lib.FormatDateDB(post.ModifiedDate)
		commentMap[post] = append(commentMap[post], comment)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return commentMap, nil
}

// Get the number of posts in the database
func (pr *PostRepository) GetNumberOfPosts() int {
	var numberOfPosts int

	row := pr.db.QueryRow("SELECT COUNT(*) FROM post")
	err := row.Scan(&numberOfPosts)
	if err != nil {
		return 0
	}
	return numberOfPosts
}

// Update a post in the database
func (pr *PostRepository) UpdatePost(post *Post) error {
	_, err := pr.db.Exec("UPDATE post SET title = ?, slug = ?, description = ?, imageURL = ?, authorID = ?, isEdited = ?, createDate = ?, modifiedDate = ? = ? WHERE id = ?",
		post.Title, post.Slug, post.Description, post.ImageURL, post.AuthorID, post.IsEdited, post.CreateDate, post.ModifiedDate, post.ID)
	return err
}

// Delete a post from the databaseNbrDislike
func (pr *PostRepository) DeletePost(postID string) error {
	_, err := pr.db.Exec("DELETE FROM post WHERE id = ?", postID)
	return err
}


