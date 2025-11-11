from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

UserModel = get_user_model()

class EmailBackend(ModelBackend):
    """
    Authenticate using email instead of username.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        email = username or kwargs.get('email')
        if email is None or password is None:
            return None

        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            return None

        # check_password is built into AbstractBaseUser
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

