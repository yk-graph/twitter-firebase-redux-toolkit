/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import firebase from 'firebase/app'

import { db } from '../firebase'
import { selectUser } from '../features/user/userSlice'
import { makeStyles } from '@material-ui/core/styles'
import { Avatar } from '@material-ui/core'
import { Message, Send } from '@material-ui/icons'
import styles from './Post.module.css'

interface Props {
  post: PostType
}

type PostType = {
  id: string
  avatar: string
  image: string
  text: string
  timestamp: any
  username: string
}

type Comment = {
  id: string
  avatar: string
  text: string
  timestamp: any
  username: string
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}))

const Post: React.FC<Props> = ({ post }) => {
  const user = useSelector(selectUser)
  const classes = useStyles()

  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '',
      avatar: '',
      text: '',
      username: '',
      timestamp: null,
    },
  ])
  const [openComments, setOpenComments] = useState(false)

  useEffect(() => {
    const unSub = db
      .collection('posts')
      .doc(post.id)
      .collection('comments')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            username: doc.data().username,
            timestamp: doc.data().timestamp,
          }))
        )
      })
    return () => {
      unSub()
    }
  }, [post.id])

  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    db.collection('posts').doc(post.id).collection('comments').add({
      avatar: user.photoUrl,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: user.displayName,
    })
    setComment('')
  }

  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={post.avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{post.username}</span>
              <span className={styles.post_headerTime}>
                {new Date(post.timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{post.text}</p>
          </div>
          {post.image && (
            <div className={styles.post_tweetImage}>
              <img src={post.image} alt="tweet" />
            </div>
          )}
        </div>

        <Message
          className={styles.post_commentIcon}
          onClick={() => setOpenComments(!openComments)}
        />
        {openComments ? (
          <>
            {comments.map((com) => (
              <div key={com.id} className={styles.post_comment}>
                <Avatar src={com.avatar} className={classes.small} />

                <span className={styles.post_commentUser}>@{com.username}</span>
                <span className={styles.post_commentText}>{com.text} </span>
                <span className={styles.post_headerTime}>
                  {new Date(com.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}

            <form onSubmit={newComment}>
              <div className={styles.post_form}>
                <input
                  className={styles.post_input}
                  type="text"
                  placeholder="Type new comment"
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setComment(e.target.value)
                  }
                />
                <button
                  disabled={!comment}
                  className={
                    comment ? styles.post_button : styles.post_buttonDisable
                  }
                  type="submit"
                >
                  <Send className={styles.post_sendIcon} />
                </button>
              </div>
            </form>
          </>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default Post
