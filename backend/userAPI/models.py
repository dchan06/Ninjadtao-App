from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, Group, Permission
from django.contrib.auth.base_user import BaseUserManager

# ----------------------------
# Custom User Manager
# ----------------------------
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # automatically hashes
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

# ----------------------------
# Custom User Model
# ----------------------------
class Membership (models.IntegerChoices): 
    Monthly = 1, "1 Month", 
    Three_Month = 2, "3 Month",
    Six_Month = 3, "6 Month", 
    Ten_Credits = 4, "10 Credits",
    Twenty_Credits = 5, "20 Credits"
    

class userModel(AbstractBaseUser, PermissionsMixin):

    userId = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    membershipName = models.IntegerField(
        choices = Membership.choices,
        default= Membership.Monthly
    )
    if membershipName == Membership.Monthly:
        expiration = "1 Month"
    elif membershipName == Membership.Three_Month:
        expiration = "3 Month"
    elif membershipName == Membership.Six_Month:
        expiration = "6 Month"
    elif membershipName == Membership.Ten_Credits:
        credsLeft = 10
    elif membershipName == Membership.Twenty_Credits:
        credsLeft = 20   
    else: 
        membershipType = "No Membership"
    

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # Avoid clashes with auth.User groups/permissions
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions_set',
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    def __str__(self):
        return self.email

# ----------------------------
# Classes Model
# ----------------------------
class Classes(models.Model):
    classId = models.AutoField(primary_key=True)
    class_name = models.CharField(max_length=100)
    class_description = models.TextField()
    class_date = models.DateTimeField()
    instructor_name = models.CharField(max_length=100)

    def __str__(self):
        return self.class_name

# ----------------------------
# Booked Classes Model
# ----------------------------
class BookedClass(models.Model):
    user = models.ForeignKey(userModel, on_delete=models.CASCADE, related_name='bookings')
    clasId = models.ForeignKey(Classes, on_delete=models.CASCADE, related_name='booked_users')
    booking_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.clasId.class_name}"
