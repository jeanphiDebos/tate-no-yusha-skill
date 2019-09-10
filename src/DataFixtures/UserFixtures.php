<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\Persistence\ObjectManager;
use App\Entity\User;

class UserFixtures extends Fixture
{
    public function load(ObjectManager $manager)
    {
        $user = new User();
        $user->setEmail('jean.philippe.debos@gmail.com');
        $user->setName('admin');
        $user->setRoles(['ROLE_ADMIN', 'ROLE_USER']);
        $user->setPlainPassword('admin');
        $user->setLvl(1);
        $manager->persist($user);

        $manager->flush();
    }
}
